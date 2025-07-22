# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.

import logging
from plugins import (
    SafariPlanningPlugin,
    HotelBookingPlugin,
    TransportCoordinationPlugin,
    ExperienceCurationPlugin,
    FeedbackSurveyPlugin,
    FallbackHandlerPlugin
)

_logger = logging.getLogger(__name__)

# Initialize one instance of each plugin
_safari_planner = SafariPlanningPlugin()
_hotel_booker = HotelBookingPlugin()
_transport_coordinator = TransportCoordinationPlugin()
_experience_curator = ExperienceCurationPlugin()
_feedback_collector = FeedbackSurveyPlugin()
_fallback = FallbackHandlerPlugin()


def _find_entity(entities: list[dict], category: str) -> str | None:
    for ent in entities:
        if ent["category"] == category:
            return ent.get("text")
    return None


def handle_new_trip_request(entities: list[dict], language: str) -> str:
    dest      = _find_entity(entities, "Destination")
    dates     = _find_entity(entities, "TravelDate")  # e.g. "2025-09-10 to 2025-09-12"
    num_people= _find_entity(entities, "PartySize") or "1"

    if not dest or not dates:
        return _fallback.handle_fallback(
            user_input=";".join([ent["text"] for ent in entities]),
            language=language
        )

    start, end = dates.split(" to ")
    return _safari_planner.plan_safari(
        destination=dest,
        start_date=start,
        end_date=end,
        num_people=int(num_people),
        language=language
    )


def handle_accommodation_inquiry(entities: list[dict], language: str) -> str:
    loc      = _find_entity(entities, "AccommodationLocation")
    checkin  = _find_entity(entities, "CheckInDate")
    checkout = _find_entity(entities, "CheckOutDate")
    rooms    = _find_entity(entities, "RoomCount") or "1"

    if not loc or not checkin or not checkout:
        return _fallback.handle_fallback(
            user_input=";".join([ent["text"] for ent in entities]),
            language=language
        )

    return _hotel_booker.book_hotel(
        location=loc,
        check_in=checkin,
        check_out=checkout,
        rooms=int(rooms),
        language=language
    )


def handle_transport_coordination(entities: list[dict], language: str) -> str:
    pickup   = _find_entity(entities, "PickupLocation")
    dropoff  = _find_entity(entities, "DropoffLocation")
    date     = _find_entity(entities, "TravelDate")

    if not pickup or not dropoff or not date:
        return _fallback.handle_fallback(
            user_input=";".join([ent["text"] for ent in entities]),
            language=language
        )

    return _transport_coordinator.coordinate_transport(
        pickup_location=pickup,
        dropoff_location=dropoff,
        date=date,
        language=language
    )


def handle_tour_activities_inquiry(entities: list[dict], language: str) -> str:
    park  = _find_entity(entities, "ParkName")
    typ   = _find_entity(entities, "ActivityType") or "wildlife viewing"
    prefs = _find_entity(entities, "Preferences") or ""

    if not park:
        return _fallback.handle_fallback(
            user_input=";".join([ent["text"] for ent in entities]),
            language=language
        )

    return _experience_curator.curate_experience(
        park_name=park,
        experience_type=typ,
        preferences=prefs,
        language=language
    )


def handle_feedback(entities: list[dict], language: str) -> str:
    trip_id = _find_entity(entities, "TripId")
    rating  = _find_entity(entities, "SatisfactionRating")
    comments= _find_entity(entities, "Comments") or ""

    if not trip_id or not rating:
        return _fallback.handle_fallback(
            user_input=";".join([ent["text"] for ent in entities]),
            language=language
        )

    return _feedback_collector.collect_feedback(
        trip_id=trip_id,
        satisfaction_rating=int(rating),
        comments=comments,
        language=language
    )


# Dispatcher mapping intent → handler
INTENT_HANDLERS: dict[str, Callable[[list[dict], str], str]] = {
    "NewTripRequest":           handle_new_trip_request,
    "ModifyTripDetails":        handle_new_trip_request,   # reuse planning
    "AccommodationInquiry":     handle_accommodation_inquiry,
    "TransportInquiry":         handle_transport_coordination,
    "TourActivitiesInquiry":    handle_tour_activities_inquiry,
    "FeedbackSubmission":       handle_feedback,
    "ContactHumanAgent":        lambda ents, lang: _fallback.handle_fallback(
                                     user_input=";".join([e["text"] for e in ents]),
                                     language=lang
                                 ),
}


def route_intent(intent: str, entities: list[dict], language: str) -> str:
    """
    Main entry point after CLU intent extraction.
    Calls the right handler or falls back if unknown.
    """
    handler = INTENT_HANDLERS.get(intent)
    if not handler:
        _logger.warning(f"No handler for intent '{intent}', invoking fallback.")
        return _fallback.handle_fallback(
            user_input=";".join([e["text"] for e in entities]),
            language=language
        )

    return handler(entities, language)
