# Copyright (c) Wildlife Tours Rwanda
# Licensed under the MIT License.
import os
import json
from typing import Callable, List, Optional

from azure.ai.projects import AIProjectClient
from semantic_kernel.agents import AzureAIAgent, AgentGroupChat
from semantic_kernel.agents.strategies import TerminationStrategy, SequentialSelectionStrategy
from semantic_kernel.contents import AuthorRole, ChatMessageContent

# Import your custom plugins
from agents.safari_planning_plugin import SafariPlanningPlugin
from agents.hotel_booking_plugin import HotelBookingPlugin
from agents.transport_coordination_plugin import TransportCoordinationPlugin
from agents.experience_curation_plugin import ExperienceCurationPlugin
from agents.feedback_survey_plugin import FeedbackSurveyPlugin
from agents.fallback_handler_plugin import FallbackHandlerPlugin

# Confidence threshold for CLU intent recognition
confidence_threshold = float(os.environ.get("CLU_CONFIDENCE_THRESHOLD", "0.5"))

class SelectionStrategy(SequentialSelectionStrategy):
    async def select_agent(self, agents: List[AzureAIAgent], history: List[ChatMessageContent]) -> Optional[AzureAIAgent]:
        last = history[-1] if history else None

        # 1. New user message → TriageAgent
        if not last or last.role == AuthorRole.USER:
            return next(a for a in agents if a.name == "TriageAgent")

        # 2. After TriageAgent
        if last.name == "TriageAgent":
            try:
                parsed = json.loads(last.content)
                # CQA route terminates
                if parsed.get("type") == "cqa_result":
                    return None
                # CLU route → check confidence
                if parsed.get("type") == "clu_result":
                    intent_info = parsed["response"]["result"]["prediction"]
                    score = intent_info["intents"][0]["confidenceScore"]
                    if score < confidence_threshold:
                        return next(a for a in agents if a.name == "FallbackHandlerAgent")
                    return next(a for a in agents if a.name == "HeadSupportAgent")
            except Exception:
                return next(a for a in agents if a.name == "FallbackHandlerAgent")

        # 3. After HeadSupportAgent
        if last.name == "HeadSupportAgent":
            try:
                parsed = json.loads(last.content)
                target = parsed.get("target_agent")
                return next(a for a in agents if a.name == target)
            except Exception:
                return next(a for a in agents if a.name == "FallbackHandlerAgent")

        # Default: no agent
        return None

class ApprovalStrategy(TerminationStrategy):
    async def should_agent_terminate(self, agent: AzureAIAgent, history: List[ChatMessageContent]) -> bool:
        last = history[-1] if history else None
        if not last:
            return False
        try:
            parsed = json.loads(last.content)
            return parsed.get("terminated") == "True" or parsed.get("need_more_info") == "True"
        except Exception:
            return False

class SemanticKernelOrchestrator:
    def __init__(
        self,
        client: AIProjectClient,
        model_name: str,
        project_endpoint: str,
        agent_ids: dict,
        fallback_function: Callable[[str, str], str],
        max_retries: int = 3
    ):
        self.client = client
        self.model_name = model_name
        self.project_endpoint = project_endpoint
        self.agent_ids = agent_ids
        self.fallback_function = fallback_function
        self.max_retries = max_retries

        # Plugin instances
        self.safari_plugin = SafariPlanningPlugin()
        self.hotel_plugin = HotelBookingPlugin()
        self.transport_plugin = TransportCoordinationPlugin()
        self.experience_plugin = ExperienceCurationPlugin()
        self.feedback_plugin = FeedbackSurveyPlugin()
        self.fallback_plugin = FallbackHandlerPlugin()

    async def initialize_agents(self) -> List[AzureAIAgent]:
        async def get_agent(key: str, description: str, plugins=None):
            definition = await self.client.agents.get_agent(self.agent_ids[key])
            return AzureAIAgent(
                client=self.client,
                definition=definition,
                description=description,
                plugins=plugins or []
            )

        triage = await get_agent("TRIAGE_AGENT_ID", "Concierge Triage Bot.")
        head = await get_agent("HEAD_SUPPORT_AGENT_ID", "Routing Agent.")
        safari = await get_agent("SAFARI_PLANNING_AGENT_ID", "Safari Planning Agent.", [self.safari_plugin])
        hotel = await get_agent("HOTEL_BOOKING_AGENT_ID", "Hotel Booking Agent.", [self.hotel_plugin])
        transport = await get_agent("TRANSPORT_COORDINATION_AGENT_ID", "Transport Coordination Agent.", [self.transport_plugin])
        experience = await get_agent("EXPERIENCE_CURATION_AGENT_ID", "Experience Curation Agent.", [self.experience_plugin])
        feedback = await get_agent("FEEDBACK_SURVEY_AGENT_ID", "Feedback Survey Agent.", [self.feedback_plugin])
        fallback = await get_agent("FALLBACK_HANDLER_AGENT_ID", "Fallback Handler Agent.", [self.fallback_plugin])

        return [triage, head, safari, hotel, transport, experience, feedback, fallback]

    async def create_agent_group_chat(self) -> None:
        agents = await self.initialize_agents()
        self.agent_group_chat = AgentGroupChat(
            agents=agents,
            selection_strategy=SelectionStrategy(agents=agents),
            termination_strategy=ApprovalStrategy(agents=agents, maximum_iterations=10, automatic_reset=True)
        )

    async def process_message(self, message_text: str, language: str = "en") -> str:
        # Wrap user input with language metadata
        user_payload = json.dumps({"text": message_text, "lang": language})
        user_msg = ChatMessageContent(role=AuthorRole.USER, content=user_payload)
        await self.agent_group_chat.add_chat_message(user_msg)

        retries = 0
        while retries < self.max_retries:
            try:
                response_content = None
                async for resp in self.agent_group_chat.invoke():
                    if resp and resp.name:
                        response_content = resp.content
                if not response_content:
                    raise ValueError("No response from agents")
                parsed = json.loads(response_content)
                if parsed.get("type") == "cqa_result":
                    return parsed['response']['answers'][0]['answer']
                return parsed['response']
            except Exception:
                retries += 1
                await self.agent_group_chat.clear_activity_signal()
                await self.agent_group_chat.reset()
        # Fallback after retries
        return self.fallback_function(message_text, language)
