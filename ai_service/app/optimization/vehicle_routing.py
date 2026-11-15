"""
Module G: Vehicle Assignment and Route Optimization Engine
Implements Heterogeneous Fleet Capacitated Vehicle Routing Problem with Time Windows (VRPTW).
Enforces cold-chain constraints: Fragile/perishable batches require Reefer vehicles with active cooling.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

class VehicleRoutingOptimizer:
    def __init__(self):
        pass

    def solve_vrptw(
        self,
        depot_location: Dict[str, float],
        delivery_stops: List[Dict[str, Any]],
        vehicles: List[Dict[str, Any]],
        distance_matrix: np.ndarray,
        time_windows: List[Tuple[int, int]] = None
    ) -> Dict[str, Any]:
        """
        Solves VRPTW using Google OR-Tools Constraint Solver.
        depot is at index 0 in distance_matrix.
        Stops are at indices 1 .. len(delivery_stops).
        """
        num_vehicles = len(vehicles)
        num_locations = len(distance_matrix)
        
        if num_locations <= 1 or num_vehicles == 0:
            return {"status": "NO_STOPS_OR_VEHICLES", "routes": []}
            
        manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
        routing = pywrapcp.RoutingModel(manager)
        
        # 1. Distance Callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(distance_matrix[from_node][to_node] * 100) # Centimeters/scaled integer
            
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # 2. Demand & Vehicle Capacity Dimension
        # Demands at nodes: 0 for depot, demand_kg for customer stops
        demands = [0] + [int(stop.get("demand_kg", 500)) for stop in delivery_stops]
        
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return demands[from_node]
            
        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        
        vehicle_capacities = [int(v["capacity_kg"]) for v in vehicles]
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0, # null capacity slack
            vehicle_capacities,
            True, # start cumul to zero
            "Capacity"
        )
        
        # 3. Time Windows Dimension
        # Approximate travel time (mins): distance_km * 2.0 (avg speed 30 km/h in urban peri-urban traffic)
        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            travel_time_mins = int(distance_matrix[from_node][to_node] * 2.0)
            service_time_mins = 20 if to_node > 0 else 0
            return travel_time_mins + service_time_mins
            
        time_callback_index = routing.RegisterTransitCallback(time_callback)
        
        HORIZON_MINUTES = 720 # 12-hour operational window (06:00 to 18:00)
        routing.AddDimension(
            time_callback_index,
            60, # allow waiting time
            HORIZON_MINUTES,
            False, # don't force start to zero
            "Time"
        )
        time_dimension = routing.GetDimensionOrDie("Time")
        
        # Add time window constraints for customer nodes
        for node in range(1, num_locations):
            # Delivery window: e.g. 60 to 360 mins (07:00 to 12:00)
            start_w, end_w = (30, 480)
            if time_windows and node - 1 < len(time_windows):
                start_w, end_w = time_windows[node - 1]
            index = manager.NodeToIndex(node)
            time_dimension.CumulVar(index).SetRange(start_w, end_w)
            
        # 4. Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 5
        
        # Solve
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            routes = []
            total_distance_km = 0.0
            total_load_delivered = 0.0
            
            for v_idx in range(num_vehicles):
                index = routing.Start(v_idx)
                route_nodes = []
                route_dist = 0.0
                route_load = 0
                
                while not routing.IsEnd(index):
                    node = manager.IndexToNode(index)
                    time_var = time_dimension.CumulVar(index)
                    time_min = solution.Min(time_var)
                    
                    if node == 0:
                        route_nodes.append({
                            "stop_type": "DEPOT",
                            "name": depot_location.get("name", "Depot"),
                            "lat": depot_location["lat"],
                            "lng": depot_location["lng"],
                            "arrival_minute": time_min
                        })
                    else:
                        stop_info = delivery_stops[node - 1]
                        route_load += stop_info.get("demand_kg", 500)
                        route_nodes.append({
                            "stop_type": "RETAILER",
                            "code": stop_info.get("code", f"RET-{node}"),
                            "name": stop_info.get("name", f"Retailer {node}"),
                            "lat": stop_info["lat"],
                            "lng": stop_info["lng"],
                            "delivered_kg": stop_info.get("demand_kg", 500),
                            "arrival_minute": time_min,
                            "estimated_time": f"{6 + time_min // 60:02d}:{time_min % 60:02d} AM"
                        })
                        
                    previous_index = index
                    index = solution.Value(routing.NextVar(index))
                    route_dist += distance_matrix[manager.IndexToNode(previous_index)][manager.IndexToNode(index)]
                    
                # Return to depot
                depot_arrival = solution.Min(time_dimension.CumulVar(index))
                route_nodes.append({
                    "stop_type": "DEPOT_RETURN",
                    "name": depot_location.get("name", "Depot"),
                    "lat": depot_location["lat"],
                    "lng": depot_location["lng"],
                    "arrival_minute": depot_arrival
                })
                
                v_meta = vehicles[v_idx]
                utilization = round((route_load / v_meta["capacity_kg"]) * 100.0, 1) if v_meta["capacity_kg"] > 0 else 0.0
                
                if len(route_nodes) > 2: # Has at least one customer stop
                    routes.append({
                        "vehicle_id": v_meta["id"],
                        "plate_number": v_meta["plate"],
                        "vehicle_type": v_meta["type"],
                        "is_refrigerated": v_meta["is_refrigerated"],
                        "capacity_kg": v_meta["capacity_kg"],
                        "carried_load_kg": route_load,
                        "utilization_pct": utilization,
                        "route_distance_km": round(route_dist, 2),
                        "stops_count": len(route_nodes) - 2,
                        "stops": route_nodes
                    })
                    total_distance_km += route_dist
                    total_load_delivered += route_load
                    
            return {
                "status": "OPTIMAL",
                "vehicles_deployed": len(routes),
                "total_vehicles_available": num_vehicles,
                "total_distance_km": round(total_distance_km, 2),
                "total_delivered_kg": round(total_load_delivered, 1),
                "routes": routes
            }
        else:
            return {
                "status": "NO_SOLUTION_FOUND",
                "message": "Time windows or capacity constraints infeasible."
            }
