# Copyright (c) Voyage Companion Ltd.
# Licensed under the MIT License.

from semantic_kernel.functions import kernel_function

"""
Feedback & Survey Agent Plugin: Collects user feedback post-trip for service improvement.
Supports multilingual responses.
"""
class FeedbackSurveyPlugin:
    @kernel_function
    def collect_feedback(self, trip_id: str, satisfaction_rating: int, comments: str, language: str = "en") -> str:
        print(f"[FeedbackSurveyPlugin] Received feedback for {trip_id}: {satisfaction_rating}/5 - {comments}")
        if language == "fr":
            return (
                "Merci pour vos retours ! Chaque commentaire nous aide à rendre vos prochaines aventures encore plus mémorables et communautaires."
            )
        return (
            "Thank you for your feedback! Your insights help us make future adventures even more memorable and community-driven."
        )