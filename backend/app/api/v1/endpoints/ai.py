import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIExplainConceptRequest,
    AIExplainCircuitRequest,
    AIExplainResultRequest,
    AIExplainCodeRequest,
    AIDebugCodeRequest,
    AIHintRequest,
    AIActionResponse,
    AIConversationSummary,
    AIConversationDetail,
)
from app.services.ai import (
    chat_with_tutor,
    explain_concept,
    explain_circuit,
    explain_result,
    explain_code,
    debug_code,
    provide_hint,
    list_conversations,
    get_conversation_detail,
    delete_conversation,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Quantum Tutor"])


@router.post("/chat", response_model=AIChatResponse)
def send_chat_message(
    payload: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sends a message to the AI Quantum Tutor with RAG knowledge retrieval and conversation history.
    """
    try:
        response_data = chat_with_tutor(
            user_id=current_user.id,
            message=payload.message,
            conversation_id=payload.conversation_id,
            context=payload.context,
            db=db,
        )
        return AIChatResponse(**response_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("AI Tutor chat failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI Tutor is temporarily unavailable. Please try again.",
        )


@router.post("/explain-concept", response_model=AIActionResponse)
def explain_quantum_concept(payload: AIExplainConceptRequest):
    """
    Explains a quantum concept using grounded knowledge base retrieval.
    """
    try:
        data = explain_concept(
            concept_query=payload.concept,
            user_level=payload.user_level or "Beginner",
        )
        return AIActionResponse(
            explanation=data["explanation"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI explain concept failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI concept explanation failed.",
        )


@router.post("/explain-circuit", response_model=AIActionResponse)
def explain_quantum_circuit_endpoint(payload: AIExplainCircuitRequest):
    """
    Analyzes an interactive circuit and explains gate transformations in sequence.
    """
    try:
        data = explain_circuit(
            circuit_data=payload.circuit,
            simulation_result=payload.simulation_results,
            user_level=payload.user_level or "Beginner",
        )
        return AIActionResponse(
            explanation=data["explanation"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI explain circuit failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI circuit analysis failed.",
        )


@router.post("/explain-result", response_model=AIActionResponse)
def explain_quantum_result_endpoint(payload: AIExplainResultRequest):
    """
    Explains quantum simulation results and clarifies finite-shot sampling statistics vs theory.
    """
    try:
        data = explain_result(
            circuit_data=payload.circuit,
            simulation_result=payload.simulation_results,
            user_level=payload.user_level or "Beginner",
        )
        return AIActionResponse(
            explanation=data["explanation"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI explain result failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI result explanation failed.",
        )


@router.post("/explain-code", response_model=AIActionResponse)
def explain_qiskit_code_endpoint(payload: AIExplainCodeRequest):
    """
    Explains a Qiskit Python code snippet in beginner-friendly language.
    """
    try:
        data = explain_code(
            code_snippet=payload.code,
            user_level=payload.user_level or "Beginner",
        )
        return AIActionResponse(
            explanation=data["explanation"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI explain code failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI code explanation failed.",
        )


@router.post("/debug-code", response_model=AIActionResponse)
def debug_qiskit_code_endpoint(payload: AIDebugCodeRequest):
    """
    Identifies common Qiskit issues and suggests fixes without executing arbitrary code.
    """
    try:
        data = debug_code(
            code_snippet=payload.code,
            error_message=payload.error_message,
            user_level=payload.user_level or "Beginner",
        )
        return AIActionResponse(
            analysis=data["analysis"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI debug code failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI code debugging failed.",
        )


@router.post("/hint", response_model=AIActionResponse)
def get_ai_hint_endpoint(payload: AIHintRequest):
    """
    Generates a progressive Socratic hint without revealing the complete solution.
    """
    try:
        data = provide_hint(
            question=payload.question,
            task_context=payload.context,
            hint_level=payload.hint_level or 1,
        )
        return AIActionResponse(
            hint=data["hint"],
            sources=data["sources"],
            suggested_follow_ups=data["suggested_follow_ups"],
        )
    except Exception as e:
        logger.exception("AI hint generation failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI hint generation failed.",
        )


@router.get("/conversations", response_model=List[AIConversationSummary])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lists all saved AI conversations belonging to the authenticated student.
    """
    return list_conversations(user_id=current_user.id, db=db)


@router.get("/conversations/{conversation_id}", response_model=AIConversationDetail)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves full message history of a specific conversation.
    """
    return get_conversation_detail(conversation_id=conversation_id, user_id=current_user.id, db=db)


@router.delete("/conversations/{conversation_id}")
def remove_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes an AI conversation belonging to the authenticated student.
    """
    return delete_conversation(conversation_id=conversation_id, user_id=current_user.id, db=db)
