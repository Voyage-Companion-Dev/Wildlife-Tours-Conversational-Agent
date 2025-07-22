# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.

from semantic_kernel.functions import kernel_function

"""
Hotel Booking Agent Plugin: Handles accommodation bookings near parks or reserves.
"""
class HotelBookingPlugin:
    @kernel_function
    def book_hotel(self, location: str, check_in: str, check_out: str, rooms: int, language: str = "en") -> str:
        print(f"[HotelBookingPlugin] Booking {rooms} room(s) in {location} from {check_in} to {check_out}")
        if language == "fr":
            return (
                f"Hôtel réservé à {location} du {check_in} au {check_out} pour {rooms} chambre(s). "
                "Séjour confortable au cœur de l'aventure communautaire !"
            )
        return (
            f"Hotel booked in {location} from {check_in} to {check_out} for {rooms} room(s). "
            "Enjoy a cozy stay and support local hosts!"
        )