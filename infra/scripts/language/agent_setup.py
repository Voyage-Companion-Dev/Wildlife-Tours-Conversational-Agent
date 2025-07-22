import json
import os
from azure.ai.agents import AgentsClient
from azure.ai.agents.models import OpenApiTool, OpenApiManagedAuthDetails, OpenApiManagedSecurityScheme
from azure.identity import DefaultAzureCredential
from utils import bind_parameters

# Plugin endpoints use same CQA/CLU tools
config = {
    'language_resource_url': os.environ.get('LANGUAGE_ENDPOINT'),
    'clu_project_name': os.environ.get('CLU_PROJECT_NAME'),
    'clu_deployment_name': os.environ.get('CLU_DEPLOYMENT_NAME'),
    'cqa_project_name': os.environ.get('CQA_PROJECT_NAME'),
    'cqa_deployment_name': os.environ.get('CQA_DEPLOYMENT_NAME'),
}

DELETE_OLD_AGENTS = os.environ.get('DELETE_OLD_AGENTS', 'false').lower() == 'true'
PROJECT_ENDPOINT = os.environ['AGENTS_PROJECT_ENDPOINT']
MODEL_NAME = os.environ['AOAI_DEPLOYMENT']
CONFIG_DIR = os.environ.get('CONFIG_DIR', '.')
config_file = os.path.join(CONFIG_DIR, 'config.json')

agents_client = AgentsClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
    api_version='2025-05-15-preview'
)

def create_tools(cfg):
    auth = OpenApiManagedAuthDetails(
        security_scheme=OpenApiManagedSecurityScheme(audience='https://cognitiveservices.azure.com/')
    )
    with open('clu.json') as f:
        clu_spec = json.loads(bind_parameters(f.read(), cfg))
    with open('cqa.json') as f:
        cqa_spec = json.loads(bind_parameters(f.read(), cfg))
    clu_tool = OpenApiTool(
        name='clu_api', spec=clu_spec,
        description='Extract intent/entities via CLU v2023-04-01',
        auth=auth
    )
    cqa_tool = OpenApiTool(
        name='cqa_api', spec=cqa_spec,
        description='Answer FAQs via CQA', auth=auth
    )
    return clu_tool, cqa_tool

with agents_client:
    if DELETE_OLD_AGENTS:
        for a in agents_client.list_agents():
            agents_client.delete_agent(a.id)

    clu_tool, cqa_tool = create_tools(config)

    # 1) Triage Agent
    triage_instructions = '''
You are the Wildlife Tours Rwanda Concierge Bot. Use exactly ONE tool:
1. cqa_api for FAQs, policies, inclusions, logistics.
2. clu_api for intent extraction (NewTripRequest, ModifyTripDetails, BookingStatus, CancelTrip, TourActivitiesInquiry, AccommodationInquiry, TravelAdvice, ContactHumanAgent).
Return JSON: for CLU: {"type":"clu_result","response":<fullResponse>,"terminated":"False"}; for CQA: {"type":"cqa_result","response":<fullResponse>,"terminated":"True"}.
If CLU confidence < threshold, call fallback_agent.
''' 
    triage = agents_client.create_agent(
        model=MODEL_NAME,
        name='TriageAgent',
        instructions=triage_instructions,
        tools=clu_tool.definitions + cqa_tool.definitions,
        temperature=0.2
    )

    # 2) Head Support Agent
    head_instructions = '''
Route based on triage CLU result field "topIntent".
Return JSON: {"target_agent":"<AgentName>","intent":"<Intent>","entities":<entities>,"terminated":"False"}.
''' 
    head = agents_client.create_agent(
        model=MODEL_NAME,
        name='HeadSupportAgent',
        instructions=head_instructions
    )

    # 3) Custom Action Agents
    def make_agent(name, instruct):
        return agents_client.create_agent(model=MODEL_NAME, name=name, instructions=instruct)

    safari_instruct = '''
You are SafariPlanningAgent. Use SafariPlanningPlugin to plan an adventurous, community-driven safari.
Return JSON: {"response":<itinerary>,"terminated":"True"}.
'''
    safari = make_agent('SafariPlanningAgent', safari_instruct)

    hotel_instruct = '''
You are HotelBookingAgent. Use HotelBookingPlugin to book lodgings.
Return JSON: {"response":<confirmation>,"terminated":"True"}.
'''
    hotel = make_agent('HotelBookingAgent', hotel_instruct)

    transport_instruct = '''
You are TransportCoordinationAgent. Use TransportCoordinationPlugin to schedule transport.
Return JSON: {"response":<confirmation>,"terminated":"True"}.
'''
    transport = make_agent('TransportCoordinationAgent', transport_instruct)

    experience_instruct = '''
You are ExperienceCurationAgent. Use ExperienceCurationPlugin to curate park activities.
Return JSON: {"response":<details>,"terminated":"True"}.
'''
    experience = make_agent('ExperienceCurationAgent', experience_instruct)

    feedback_instruct = '''
You are FeedbackSurveyAgent. Use FeedbackSurveyPlugin to collect user feedback.
Return JSON: {"response":<ack>,"terminated":"True"}.
'''
    feedback = make_agent('FeedbackSurveyAgent', feedback_instruct)

    fallback_instruct = '''
You are FallbackHandlerAgent. Use FallbackHandlerPlugin to handle unclear requests.
Return JSON: {"response":<prompt>,"terminated":"True"}.
'''
    fallback = make_agent('FallbackHandlerAgent', fallback_instruct)

    # Save agent IDs
    ids = {
        'TRIAGE_AGENT_ID': triage.id,
        'HEAD_SUPPORT_AGENT_ID': head.id,
        'SAFARI_PLANNING_AGENT_ID': safari.id,
        'HOTEL_BOOKING_AGENT_ID': hotel.id,
        'TRANSPORT_COORDINATION_AGENT_ID': transport.id,
        'EXPERIENCE_CURATION_AGENT_ID': experience.id,
        'FEEDBACK_SURVEY_AGENT_ID': feedback.id,
        'FALLBACK_HANDLER_AGENT_ID': fallback.id
    }
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(config_file, 'w') as f:
        json.dump(ids, f, indent=2)
    print('Agent IDs written to', config_file)
    print(json.dumps(ids, indent=2))
    print('Agents setup complete.')
    print('Running the agent orchestrator with: python infra/scripts/language/agent_orchestrator.py')