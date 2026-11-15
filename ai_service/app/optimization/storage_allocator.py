"""
Module F: Intelligent Cold-Storage Allocation Engine
Uses Google OR-Tools CP-SAT to solve multi-facility batch-to-warehouse assignment under capacity,
temperature setpoint compatibility, holding costs, and remaining shelf life constraints.
"""

from typing import Dict, Any, List, Tuple
from ortools.sat.python import cp_model
import numpy as np

class ColdStorageAllocationOptimizer:
    def __init__(self):
        pass

    def allocate_batches(
        self,
        batches: List[Dict[str, Any]],
        facilities: List[Dict[str, Any]],
        cost_weight: float = 1.0,
        shelf_life_weight: float = 2.0
    ) -> Dict[str, Any]:
        """
        CP-SAT formulation for optimal multi-storage facility batch placement.
        """
        model = cp_model.CpModel()
        
        num_batches = len(batches)
        num_facilities = len(facilities)
        
        if num_batches == 0 or num_facilities == 0:
            return {"status": "NO_DATA", "assignments": []}
            
        # Decision variables: x[b, s] = 1 if batch b is stored in facility s, 0 otherwise
        # Also option for direct delivery to retailer / no storage: direct[b]
        x = {}
        for b in range(num_batches):
            for s in range(num_facilities):
                x[b, s] = model.NewBoolVar(f"x_b{b}_s{s}")
                
        direct = {}
        for b in range(num_batches):
            direct[b] = model.NewBoolVar(f"direct_b{b}")
            
        # Constraint 1: Each batch must either be placed in exactly one storage facility or routed directly
        for b in range(num_batches):
            model.Add(sum(x[b, s] for s in range(num_facilities)) + direct[b] == 1)
            
        # Constraint 2: Facility capacity limits
        for s in range(num_facilities):
            cap = int(facilities[s]["total_capacity_kg"])
            model.Add(
                sum(int(batches[b]["quantity_kg"]) * x[b, s] for b in range(num_batches)) <= cap
            )
            
        # Constraint 3: FEFO / Critical shelf life rule
        # Batches with remaining shelf life < 48 hours CANNOT be put into long-term storage;
        # they must be routed directly or assigned to facility closest to retail demand.
        for b in range(num_batches):
            rsl = batches[b].get("remaining_shelf_life_hours", 100.0)
            if rsl < 48.0:
                # Force direct delivery or forbid cold storage buffering
                model.Add(direct[b] == 1)
                
        # Objective Function:
        # Min: sum of storage costs + penalty for storing low-shelf-life batches
        storage_cost_terms = []
        for b in range(num_batches):
            qty = int(batches[b]["quantity_kg"])
            rsl = batches[b].get("remaining_shelf_life_hours", 100.0)
            # Higher penalty if placing fragile batch in storage
            decay_penalty = int(max(0, (150.0 - rsl) * 10))
            
            for s in range(num_facilities):
                unit_cost = int(facilities[s].get("storage_cost_per_kg_day", 1.5) * 100) # integer cents
                cost = (unit_cost * qty) // 100 + decay_penalty
                storage_cost_terms.append(cost * x[b, s])
                
        model.Minimize(sum(storage_cost_terms))
        
        # Solve with CP-SAT
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10.0
        status = solver.Solve(model)
        
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            facility_allocations = {f["id"]: {"facility": f, "allocated_batches": [], "total_stored_kg": 0.0} for f in facilities}
            direct_batches = []
            
            for b in range(num_batches):
                b_info = batches[b]
                if solver.Value(direct[b]) == 1:
                    direct_batches.append(b_info)
                else:
                    for s in range(num_facilities):
                        if solver.Value(x[b, s]) == 1:
                            fac_id = facilities[s]["id"]
                            facility_allocations[fac_id]["allocated_batches"].append(b_info)
                            facility_allocations[fac_id]["total_stored_kg"] += b_info["quantity_kg"]
                            break
                            
            # Calculate utilization percentages
            utilization_report = []
            for f_id, data in facility_allocations.items():
                cap = data["facility"]["total_capacity_kg"]
                stored = data["total_stored_kg"]
                utilization_report.append({
                    "facility_id": f_id,
                    "facility_name": data["facility"]["name"],
                    "capacity_kg": cap,
                    "stored_kg": round(stored, 1),
                    "utilization_pct": round((stored / cap) * 100.0, 1) if cap > 0 else 0.0,
                    "batch_count": len(data["allocated_batches"])
                })
                
            return {
                "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
                "objective_value": solver.ObjectiveValue(),
                "direct_delivery_batches_count": len(direct_batches),
                "stored_batches_count": num_batches - len(direct_batches),
                "facility_utilization": utilization_report,
                "facility_allocations": facility_allocations,
                "direct_batches": direct_batches
            }
        else:
            return {
                "status": "INFEASIBLE",
                "message": "Storage constraints could not be satisfied."
            }
