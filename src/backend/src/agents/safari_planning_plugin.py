# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.

from semantic_kernel.functions import kernel_function

"""
Safari Planning Agent Plugin: Assists users in planning wildlife safari tours.
Collects travel preferences and returns suggested itineraries.
"""
class SafariPlanningPlugin:
    @kernel_function
    def plan_safari(self, destination: str, start_date: str, end_date: str, num_people: int, language: str = "en") -> str:
        print(f"[SafariPlanningPlugin] Planning safari to {destination} from {start_date} to {end_date} for {num_people} people")
        if language == "fr":
            return (
                f"Votre safari aventureux à {destination} du {start_date} au {end_date} pour {num_people} personne(s) est prêt ! "
                "Préparez-vous à vivre des moments magiques et à soutenir les communautés locales."
            )
        return (
            f"Your adventurous safari to {destination} from {start_date} to {end_date} for {num_people} people is planned! "
            "Get ready for wildlife magic and meaningful community connections."
        )