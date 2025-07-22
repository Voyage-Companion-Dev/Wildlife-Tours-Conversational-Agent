
from semantic_kernel.functions import kernel_function


"""
Fallback Handler Plugin: Engages users when intent or inputs are unclear.
Supports multilingual prompts.
"""
class FallbackHandlerPlugin:
    @kernel_function
    def handle_fallback(self, user_input: str, language: str = "en") -> str:
        print(f"[FallbackHandlerPlugin] Handling unclear input: {user_input}")
        if language == "fr":
            return (
                "Je n'ai pas bien compris. Pouvez-vous préciser votre demande ? "
                "Par exemple : 'Je veux planifier un safari gorilles à Volcanoes du 10 au 12 août'."
            )
        return (
            "I didn't quite catch that. Could you clarify your request? "
            "For example: 'I want a gorilla safari in Volcanoes from August 10 to 12'."
        )
