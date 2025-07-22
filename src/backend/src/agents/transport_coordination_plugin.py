# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.

from semantic_kernel.functions import kernel_function

"""
Transport Coordination Agent Plugin: Arranges local travel (4x4s, guides, airport pickups).
Supports multilingual responses.
"""
class TransportCoordinationPlugin:
    @kernel_function
    def coordinate_transport(self, pickup_location: str, dropoff_location: str, date: str, language: str = "en") -> str:
        print(f"[TransportCoordinationPlugin] Coordinating transport from {pickup_location} to {dropoff_location} on {date}")
        if language == "fr":
            return (
                f"Transport de {pickup_location} à {dropoff_location} le {date} confirmé. "
                "Profitez du trajet avec nos guides locaux et découvrez la beauté sauvage."
            )
        return (
            f"Transport from {pickup_location} to {dropoff_location} on {date} is confirmed. "
            "Enjoy the scenic route with our local guides!"
        )