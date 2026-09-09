"""Backend API tests for Vineet Events Creations."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://blog-574.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@vineetevents.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# -------- Root / health --------
def test_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert "message" in r.json()


# -------- Auth --------
def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_me_requires_auth():
    r = requests.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 401


def test_me_with_token(auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


# -------- Public enquiry --------
def test_create_enquiry_and_visible_in_admin(auth_headers):
    unique_name = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {
        "name": unique_name,
        "phone": "+919999999999",
        "email": "test@example.com",
        "event_type": "wedding",
        "event_date": "2026-05-01",
        "city": "Dehradun",
        "budget": "5-10 Lakh",
        "message": "Please contact"
    }
    r = requests.post(f"{API}/enquiries", json=payload, timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["success"] is True
    enquiry_id = body["id"]

    # Verify visible in admin list
    r = requests.get(f"{API}/admin/enquiries", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    items = r.json()
    match = [i for i in items if i.get("id") == enquiry_id]
    assert match, "Newly created enquiry not found in admin list"
    assert match[0]["name"] == unique_name
    assert match[0]["status"] == "pending"

    # Cleanup
    requests.delete(f"{API}/admin/enquiries/{enquiry_id}", headers=auth_headers, timeout=10)


def test_admin_list_requires_auth():
    r = requests.get(f"{API}/admin/enquiries", timeout=10)
    assert r.status_code == 401


def test_admin_stats(auth_headers):
    r = requests.get(f"{API}/admin/stats", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    data = r.json()
    for k in ["total", "pending", "contacted", "booked", "archived"]:
        assert k in data
        assert isinstance(data[k], int)


def test_update_and_delete_enquiry(auth_headers):
    # Create
    payload = {"name": f"TEST_{uuid.uuid4().hex[:6]}", "phone": "+911111111111"}
    r = requests.post(f"{API}/enquiries", json=payload, timeout=10)
    eid = r.json()["id"]

    # Patch status + notes
    r = requests.patch(
        f"{API}/admin/enquiries/{eid}",
        headers=auth_headers,
        json={"status": "contacted", "notes": "Called customer"},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["status"] == "contacted"
    assert doc["notes"] == "Called customer"

    # Verify persisted via list
    r = requests.get(f"{API}/admin/enquiries", headers=auth_headers, timeout=10)
    found = next((i for i in r.json() if i["id"] == eid), None)
    assert found and found["status"] == "contacted"

    # Delete
    r = requests.delete(f"{API}/admin/enquiries/{eid}", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    # Second delete -> 404
    r = requests.delete(f"{API}/admin/enquiries/{eid}", headers=auth_headers, timeout=10)
    assert r.status_code == 404


def test_patch_nonexistent(auth_headers):
    r = requests.patch(f"{API}/admin/enquiries/nonexistent-id", headers=auth_headers, json={"status": "booked"}, timeout=10)
    assert r.status_code == 404


# -------- Chatbot --------
def test_chat_reply():
    sid = f"test-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{API}/chat", json={"session_id": sid, "message": "Russian dancers ka rate?"}, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "reply" in data
    assert isinstance(data["reply"], str) and len(data["reply"]) > 0
