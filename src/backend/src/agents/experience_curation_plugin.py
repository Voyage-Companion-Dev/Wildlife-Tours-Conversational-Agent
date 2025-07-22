# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.

from semantic_kernel.functions import kernel_function


"""
Experience Curation Agent Plugin: Curates park experiences, cultural add-ons, and guided activities.
Supports multilingual responses.
"""
class ExperienceCurationPlugin:
    @kernel_function
    def curate_experience(self, park_name: str, experience_type: str, preferences: str, language: str = "en") -> str:
        print(f"[ExperienceCurationPlugin] Curating {experience_type} in {park_name} based on {preferences}")
        if language == "fr":
            return (
                f"Expérience '{experience_type}' au parc {park_name} organisée selon vos préférences. "
                "Vivez l'aventure et la culture locale en toute authenticité."
            )
        return (
            f"{experience_type} experience at {park_name} has been curated with your preferences. "
            "Enjoy authentic adventure and local culture."
        )
