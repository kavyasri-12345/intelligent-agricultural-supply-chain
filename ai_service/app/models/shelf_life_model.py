"""
Module E: Temperature-Aware Shelf-Life Estimation & FEFO Engine
Scientific Foundation: Arrhenius reaction kinetics and Q10 temperature coefficients for post-harvest tomatoes.
Implements First-Expired, First-Out (FEFO) dynamic prioritization and delivery feasibility gating.
"""

import math
from typing import Dict, Any, List, Optional
import numpy as np

class ShelfLifeKineticEngine:
    def __init__(
        self, 
        crop: str = "Tomato",
        base_shelf_life_hours: float = 336.0,  # 14 days at 12C
        t_ref: float = 12.0,                   # Recommended cold storage setpoint (Celsius)
        q10: float = 2.2,                      # Temperature sensitivity coefficient
        critical_firmness_threshold: float = 0.55 # Minimum salable firmness index
    ):
        self.crop = crop
        self.base_shelf_life_hours = base_shelf_life_hours
        self.t_ref = t_ref
        self.q10 = q10
        self.critical_firmness_threshold = critical_firmness_threshold

    def calculate_deterioration_rate(self, current_temp_c: float) -> float:
        """
        Deterioration acceleration factor relative to optimum 12C reference temperature:
        k(T) / k(T_ref) = Q10 ^ ((T - T_ref) / 10.0)
        """
        exponent = (current_temp_c - self.t_ref) / 10.0
        return float(self.q10 ** exponent)

    def estimate_remaining_shelf_life(
        self,
        harvest_age_hours: float,
        temperature_history: List[float],
        projected_future_temp_c: float = 25.0
    ) -> Dict[str, Any]:
        """
        Integrates thermal exposure trajectory to compute consumed and remaining shelf life hours.
        """
        if not temperature_history:
            temperature_history = [25.0]
            
        # Cumulative equivalent hours at T_ref
        equivalent_hours_consumed = 0.0
        step_duration = harvest_age_hours / max(1, len(temperature_history))
        
        for temp in temperature_history:
            rate = self.calculate_deterioration_rate(temp)
            equivalent_hours_consumed += step_duration * rate
            
        remaining_equivalent_hours = max(0.0, self.base_shelf_life_hours - equivalent_hours_consumed)
        
        # Project remaining hours under expected future ambient conditions
        future_rate = self.calculate_deterioration_rate(projected_future_temp_c)
        remaining_real_hours = remaining_equivalent_hours / future_rate if future_rate > 0 else 0.0
        
        # Quality index Q(t) from 1.0 (pristine) to 0.0 (fully decayed)
        quality_index = max(0.0, min(1.0, 1.0 - (equivalent_hours_consumed / self.base_shelf_life_hours)))
        
        return {
            "equivalent_hours_consumed": round(equivalent_hours_consumed, 1),
            "remaining_shelf_life_hours": round(remaining_real_hours, 1),
            "quality_index": round(quality_index, 3),
            "is_salable": quality_index >= self.critical_firmness_threshold
        }

    def prioritize_batches_fefo(
        self, 
        batches: List[Dict[str, Any]], 
        projected_transit_hours: float = 4.0
    ) -> List[Dict[str, Any]]:
        """
        Ranks batches strictly by First-Expired, First-Out (FEFO) principle.
        Filters and flags infeasible delivery candidates.
        """
        evaluated = []
        for b in batches:
            b_copy = b.copy()
            seq = b.get("telemetry_sequence", [])
            temp_hist = [s["temp_c"] for s in seq] if seq else [b.get("avg_exposure_temp_c", 26.0)]
            
            shelf_eval = self.estimate_remaining_shelf_life(
                harvest_age_hours=b.get("harvest_age_hours", 24.0),
                temperature_history=temp_hist,
                projected_future_temp_c=26.0
            )
            
            rsl = shelf_eval["remaining_shelf_life_hours"]
            b_copy["remaining_shelf_life_hours"] = rsl
            b_copy["quality_index"] = shelf_eval["quality_index"]
            b_copy["is_salable"] = shelf_eval["is_salable"]
            
            # Delivery feasibility condition: RSL must exceed transit time + minimum retail display buffer (12 hours)
            MIN_RETAIL_BUFFER_HOURS = 12.0
            if rsl < (projected_transit_hours + MIN_RETAIL_BUFFER_HOURS):
                b_copy["delivery_feasible"] = False
                b_copy["dispatch_action"] = "DIVERT_TO_PROCESSING_OR_LOCAL_SALE"
            else:
                b_copy["delivery_feasible"] = True
                b_copy["dispatch_action"] = "FEFO_SCHEDULED_DISPATCH"
                
            evaluated.append(b_copy)
            
        # Sort ascending by remaining shelf life: FEFO order
        evaluated.sort(key=lambda x: x["remaining_shelf_life_hours"])
        
        for rank, b in enumerate(evaluated, start=1):
            b["fefo_priority_rank"] = rank
            
        return evaluated
