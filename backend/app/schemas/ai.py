from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class AISourceItem(BaseModel):
    title: str
    module: str


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User prompt or question")
    conversation_id: Optional[int] = Field(default=None, description="Existing conversation ID to continue")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Current student lesson/circuit/code context")


class AIChatResponse(BaseModel):
    conversation_id: int
    message: str
    sources: List[AISourceItem] = []
    suggested_follow_ups: List[str] = []
    timestamp: str


class AIExplainConceptRequest(BaseModel):
    concept: str = Field(..., min_length=1, description="Quantum concept to explain")
    user_level: Optional[str] = Field(default="Beginner")


class AIExplainCircuitRequest(BaseModel):
    circuit: Dict[str, Any] = Field(..., description="Structured circuit grid data")
    simulation_results: Optional[Dict[str, Any]] = Field(default=None)
    user_level: Optional[str] = Field(default="Beginner")


class AIExplainResultRequest(BaseModel):
    circuit: Optional[Dict[str, Any]] = Field(default=None)
    simulation_results: Optional[Dict[str, Any]] = Field(default=None)
    user_level: Optional[str] = Field(default="Beginner")


class AIExplainCodeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Qiskit Python code snippet")
    user_level: Optional[str] = Field(default="Beginner")


class AIDebugCodeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Qiskit Python code snippet to debug")
    error_message: Optional[str] = Field(default=None)
    user_level: Optional[str] = Field(default="Beginner")


class AIHintRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question or task to give a hint for")
    context: Optional[Dict[str, Any]] = Field(default=None)
    hint_level: Optional[int] = Field(default=1, ge=1, le=3)


class AIActionResponse(BaseModel):
    explanation: Optional[str] = None
    analysis: Optional[str] = None
    hint: Optional[str] = None
    sources: List[AISourceItem] = []
    suggested_follow_ups: List[str] = []


class AIConversationSummary(BaseModel):
    id: int
    title: str
    context_type: str
    created_at: str
    updated_at: str
    message_count: int


class AIMessageItem(BaseModel):
    id: int
    sender: str
    content: str
    code_snippet: Optional[str] = None
    suggested_actions: List[str] = []
    created_at: str


class AIConversationDetail(BaseModel):
    id: int
    title: str
    context_type: str
    created_at: str
    updated_at: str
    messages: List[AIMessageItem] = []
