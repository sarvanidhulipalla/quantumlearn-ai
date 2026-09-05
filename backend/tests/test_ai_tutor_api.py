import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def get_auth_token(email: str = "student@quantumlearn.ai", password: str = "QuantumLearn2026!"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


def test_ai_chat_auth_required():
    """Test 1: AI chat requires authenticated student."""
    res = client.post("/api/v1/ai/chat", json={"message": "Hello AI tutor!"})
    assert res.status_code == 401
    print("[PASS] AI Chat authentication requirement verified")


def test_ai_chat_with_rag_retrieval():
    """Test 2: AI chat returns grounded response with verified sources."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "message": "What is quantum superposition and how does the Hadamard gate work?",
        "context": {
            "type": "lesson",
            "lesson": {"title": "Understanding Superposition"}
        }
    }
    res = client.post("/api/v1/ai/chat", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "conversation_id" in data
    assert len(data["message"]) > 20
    assert len(data["sources"]) > 0
    assert "Superposition" in data["sources"][0]["title"] or "Hadamard" in data["sources"][0]["title"] or "Fundamentals" in data["sources"][0]["title"]
    assert len(data["suggested_follow_ups"]) > 0
    print(f"[PASS] AI Chat with RAG verified! Source: {data['sources'][0]['title']}")
    return data["conversation_id"]


def test_conversation_isolation():
    """Test 3: Student B cannot access Student A's conversation."""
    student_a_token = get_auth_token("student@quantumlearn.ai", "QuantumLearn2026!")
    headers_a = {"Authorization": f"Bearer {student_a_token}"}
    
    # Create conversation as Student A
    res_a = client.post("/api/v1/ai/chat", json={"message": "Private quantum question"}, headers=headers_a)
    conv_id = res_a.json()["conversation_id"]

    # Student B (Instructor or new user) tries to access Student A's conversation
    student_b_token = get_auth_token("instructor@quantumlearn.ai", "QuantumLearn2026!")
    headers_b = {"Authorization": f"Bearer {student_b_token}"}
    
    res_b = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=headers_b)
    assert res_b.status_code == 404
    print("[PASS] Conversation isolation verified: Student B cannot access Student A's session")


def test_explain_concept():
    """Test 4: Explain concept with grounded knowledge base."""
    payload = {
        "concept": "Bloch Sphere geometric representation",
        "user_level": "Beginner"
    }
    res = client.post("/api/v1/ai/explain-concept", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Bloch" in data["explanation"]
    assert len(data["sources"]) > 0
    print("[PASS] Explain Concept endpoint verified")


def test_explain_circuit():
    """Test 5: Explain circuit with actual gate data."""
    payload = {
        "circuit": {
            "qubits": 2,
            "classical_bits": 2,
            "gates": [
                {"type": "H", "qubit": 0, "step": 0},
                {"type": "CX", "qubit": 0, "target": 1, "step": 1}
            ]
        },
        "simulation_results": {
            "shots": 1024,
            "counts": {"00": 512, "11": 512}
        },
        "user_level": "Beginner"
    }
    res = client.post("/api/v1/ai/explain-circuit", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Circuit Analysis" in data["explanation"]
    assert "Hadamard" in data["explanation"]
    assert "CNOT" in data["explanation"]
    print("[PASS] Explain Circuit endpoint verified with actual gates")


def test_explain_result():
    """Test 6: Explain simulation result and shot noise."""
    payload = {
        "simulation_results": {
            "shots": 1024,
            "counts": {"00": 505, "11": 519},
            "probabilities": {"00": 0.493, "11": 0.507}
        }
    }
    res = client.post("/api/v1/ai/explain-result", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Qiskit Aer" in data["explanation"]
    assert "505" in data["explanation"]
    print("[PASS] Explain Result endpoint verified with finite-shot analysis")


def test_explain_code():
    """Test 7: Explain Qiskit code snippet."""
    payload = {
        "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()"
    }
    res = client.post("/api/v1/ai/explain-code", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["explanation"]) > 20
    print("[PASS] Explain Code endpoint verified")


def test_debug_code():
    """Test 8: Debug Qiskit code without executing arbitrary Python."""
    payload = {
        "code": "qc = QuantumCircuit(2, 2)\nqc.cx(0, 0)",
        "error_message": "Cannot apply CX with identical control and target"
    }
    res = client.post("/api/v1/ai/debug-code", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Analysis" in data["analysis"]
    print("[PASS] Debug Code endpoint verified")


def test_hint_mode():
    """Test 9: Hint mode provides guidance without full answer."""
    payload = {
        "question": "How do I create a Bell state?",
        "hint_level": 1
    }
    res = client.post("/api/v1/ai/hint", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Hint" in data["hint"]
    print("[PASS] AI Hint Mode verified")


def test_conversation_management():
    """Test 10: List, fetch detail, and delete conversations."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a conversation
    res_msg = client.post("/api/v1/ai/chat", json={"message": "Temporary conversation topic"}, headers=headers)
    conv_id = res_msg.json()["conversation_id"]

    # 2. List conversations
    res_list = client.get("/api/v1/ai/conversations", headers=headers)
    assert res_list.status_code == 200
    conv_list = res_list.json()
    assert any(c["id"] == conv_id for c in conv_list)

    # 3. Get detail
    res_detail = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=headers)
    assert res_detail.status_code == 200
    assert len(res_detail.json()["messages"]) >= 2

    # 4. Delete
    res_del = client.delete(f"/api/v1/ai/conversations/{conv_id}", headers=headers)
    assert res_del.status_code == 200

    # 5. Verify deleted
    res_check = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=headers)
    assert res_check.status_code == 404
    print("[PASS] Conversation management (List, Get, Delete) verified")


if __name__ == "__main__":
    test_ai_chat_auth_required()
    test_ai_chat_with_rag_retrieval()
    test_conversation_isolation()
    test_explain_concept()
    test_explain_circuit()
    test_explain_result()
    test_explain_code()
    test_debug_code()
    test_hint_mode()
    test_conversation_management()
    print("\nALL PHASE 5 AI QUANTUM TUTOR TESTS PASSED SUCCESSFULLY!")
