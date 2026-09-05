import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.ai import AIConversation, AIMessage
from app.models.user import User
from app.services.ai.retrieval import retrieve_relevant_knowledge
from app.services.ai.prompts import (
    SYSTEM_TUTOR_PROMPT,
    HINT_SYSTEM_PROMPT,
    CIRCUIT_EXPLANATION_SYSTEM_PROMPT,
    RESULT_EXPLANATION_SYSTEM_PROMPT,
    CODE_DEBUG_SYSTEM_PROMPT,
)
from app.services.ai.provider import llm_provider
from app.services.ai.context import build_tutor_context


def chat_with_tutor(
    user_id: int,
    message: str,
    conversation_id: Optional[int] = None,
    context: Optional[Dict[str, Any]] = None,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Main chat orchestration endpoint with RAG knowledge retrieval and conversation memory.
    """
    context = context or {}

    # 1. Retrieve or create conversation if DB session is available
    conversation = None
    if db is not None:
        if conversation_id:
            conversation = db.query(AIConversation).filter(
                AIConversation.id == conversation_id,
                AIConversation.user_id == user_id,
            ).first()
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or unauthorized.",
                )
        else:
            # Create a title based on the first query
            title = message[:40] + ("..." if len(message) > 40 else "")
            conversation = AIConversation(
                user_id=user_id,
                title=title,
                context_type=context.get("type", "general"),
                context_id=context.get("lesson_id"),
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Store user message
        user_msg = AIMessage(
            conversation_id=conversation.id,
            sender="user",
            content=message,
        )
        db.add(user_msg)
        db.commit()

    # 2. Retrieve verified RAG knowledge
    retrieval_query = message
    if "lesson" in context and isinstance(context["lesson"], dict):
        retrieval_query += " " + context["lesson"].get("title", "")

    retrieved_sources = retrieve_relevant_knowledge(retrieval_query, top_k=3)

    # 3. Synthesize response
    ai_output = llm_provider.generate_response(
        system_prompt=SYSTEM_TUTOR_PROMPT,
        user_prompt=message,
        retrieved_sources=retrieved_sources,
        context_data=context,
    )

    # 4. Save assistant response to DB
    if db is not None and conversation is not None:
        assistant_msg = AIMessage(
            conversation_id=conversation.id,
            sender="assistant",
            content=ai_output["content"],
            suggested_actions_json=json.dumps(ai_output.get("suggested_follow_ups", [])),
        )
        conversation.updated_at = datetime.now(timezone.utc)
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

    # Build sources response
    sources = []
    if ai_output.get("source_title"):
        sources.append({
            "title": ai_output["source_title"],
            "module": ai_output.get("source_module", "Quantum Curriculum"),
        })

    return {
        "conversation_id": conversation.id if conversation else 1,
        "message": ai_output["content"],
        "sources": sources,
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def explain_concept(concept_query: str, user_level: str = "Beginner") -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge(concept_query, top_k=3)
    context = {"user_level": user_level}
    ai_output = llm_provider.generate_response(SYSTEM_TUTOR_PROMPT, concept_query, sources, context)
    return {
        "concept": concept_query,
        "explanation": ai_output["content"],
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def explain_circuit(circuit_data: Dict[str, Any], simulation_result: Optional[Dict[str, Any]] = None, user_level: str = "Beginner") -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge("quantum circuit gates entanglement superposition", top_k=2)
    context = {
        "user_level": user_level,
        "circuit": circuit_data,
        "results": simulation_result or {},
    }
    ai_output = llm_provider.generate_response(CIRCUIT_EXPLANATION_SYSTEM_PROMPT, "Explain this circuit", sources, context)
    return {
        "explanation": ai_output["content"],
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def explain_result(circuit_data: Optional[Dict[str, Any]] = None, simulation_result: Optional[Dict[str, Any]] = None, user_level: str = "Beginner") -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge("finite shots vs probability sampling noise", top_k=2)
    context = {
        "user_level": user_level,
        "circuit": circuit_data or {},
        "results": simulation_result or {},
    }
    ai_output = llm_provider.generate_response(RESULT_EXPLANATION_SYSTEM_PROMPT, "Explain this result", sources, context)
    return {
        "explanation": ai_output["content"],
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def explain_code(code_snippet: str, user_level: str = "Beginner") -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge("qiskit programming quantumcircuit", top_k=2)
    context = {"user_level": user_level, "code": code_snippet}
    ai_output = llm_provider.generate_response(SYSTEM_TUTOR_PROMPT, f"Explain this Qiskit code:\n{code_snippet}", sources, context)
    return {
        "explanation": ai_output["content"],
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def debug_code(code_snippet: str, error_message: Optional[str] = None, user_level: str = "Beginner") -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge("qiskit errors circuit debugging", top_k=2)
    context = {"user_level": user_level, "code": code_snippet, "error": error_message or ""}
    ai_output = llm_provider.generate_response(CODE_DEBUG_SYSTEM_PROMPT, f"Debug this Qiskit code:\n{code_snippet}", sources, context)
    return {
        "analysis": ai_output["content"],
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def provide_hint(question: str, task_context: Optional[Dict[str, Any]] = None, hint_level: int = 1) -> Dict[str, Any]:
    sources = retrieve_relevant_knowledge(question, top_k=2)
    context = task_context or {}
    ai_output = llm_provider.generate_response(HINT_SYSTEM_PROMPT, f"Give me a hint for: {question}", sources, context)
    return {
        "hint": ai_output["content"],
        "hint_level": hint_level,
        "sources": [{"title": ai_output["source_title"], "module": ai_output["source_module"]}],
        "suggested_follow_ups": ai_output.get("suggested_follow_ups", []),
    }


def list_conversations(user_id: int, db: Session) -> List[Dict[str, Any]]:
    convs = db.query(AIConversation).filter(
        AIConversation.user_id == user_id
    ).order_by(AIConversation.updated_at.desc()).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "context_type": c.context_type,
            "context_id": c.context_id,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
            "message_count": len(c.messages),
        }
        for c in convs
    ]


def get_conversation_detail(conversation_id: int, user_id: int, db: Session) -> Dict[str, Any]:
    conv = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == user_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or unauthorized.",
        )

    messages = []
    for m in conv.messages:
        actions = []
        if m.suggested_actions_json:
            try:
                actions = json.loads(m.suggested_actions_json)
            except Exception:
                actions = []

        messages.append({
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "code_snippet": m.code_snippet,
            "suggested_actions": actions,
            "created_at": m.created_at.isoformat(),
        })

    return {
        "id": conv.id,
        "title": conv.title,
        "context_type": conv.context_type,
        "created_at": conv.created_at.isoformat(),
        "updated_at": conv.updated_at.isoformat(),
        "messages": messages,
    }


def delete_conversation(conversation_id: int, user_id: int, db: Session) -> Dict[str, Any]:
    conv = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == user_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or unauthorized.",
        )

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully.", "id": conversation_id}
