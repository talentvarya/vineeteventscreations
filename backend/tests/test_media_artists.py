"""Tests for media, artists, upload, files endpoints (iteration 2)."""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://blog-574.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@vineetevents.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def headers(token):
    return {"Authorization": f"Bearer {token}"}


# 1x1 png bytes
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?"
    b"\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"
)


# ---- Public GET media & artists ----
def test_public_media_list():
    r = requests.get(f"{API}/media", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1
    assert "url" in data[0] and "category" in data[0]


def test_public_media_reels_filter():
    r = requests.get(f"{API}/media", params={"reel": "true"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert all(item.get("is_reel") is True for item in data)


def test_public_media_category_filter():
    r = requests.get(f"{API}/media", params={"category": "weddings"}, timeout=15)
    assert r.status_code == 200
    for item in r.json():
        assert item["category"] == "weddings"


def test_public_artists_list():
    r = requests.get(f"{API}/artists", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1
    a = data[0]
    for k in ["id", "name", "category", "availability", "url"]:
        assert k in a


# ---- Auth protection on all /api/admin/* ----
@pytest.mark.parametrize("method,path", [
    ("POST", "/admin/upload"),
    ("POST", "/admin/media"),
    ("DELETE", "/admin/media/xyz"),
    ("POST", "/admin/artists"),
    ("PATCH", "/admin/artists/xyz"),
    ("DELETE", "/admin/artists/xyz"),
])
def test_admin_endpoints_require_auth(method, path):
    r = requests.request(method, f"{API}{path}", timeout=15)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


# ---- Upload + create media + serve file + delete ----
def test_upload_create_serve_delete_flow(headers):
    files = {"file": ("test.png", io.BytesIO(PNG_1x1), "image/png")}
    r = requests.post(f"{API}/admin/upload", headers=headers, files=files, timeout=60)
    assert r.status_code == 200, r.text
    up = r.json()
    assert up["kind"] == "image"
    assert up["storage_path"]
    storage_path = up["storage_path"]

    # Create media
    title = f"TEST_{uuid.uuid4().hex[:6]}"
    r = requests.post(
        f"{API}/admin/media",
        headers=headers,
        json={"title": title, "category": "weddings", "kind": "image", "is_reel": True,
              "storage_path": storage_path},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    media = r.json()
    media_id = media["id"]
    assert media["title"] == title
    assert media["is_reel"] is True
    assert media["url"] == f"/api/files/{storage_path}"

    # Verify visible on public list
    r = requests.get(f"{API}/media", timeout=15)
    ids = [m["id"] for m in r.json()]
    assert media_id in ids

    # Serve the file
    r = requests.get(f"{API}/files/{storage_path}", timeout=30)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/")
    assert len(r.content) > 0

    # Delete (soft)
    r = requests.delete(f"{API}/admin/media/{media_id}", headers=headers, timeout=15)
    assert r.status_code == 200

    # No longer public
    r = requests.get(f"{API}/media", timeout=15)
    assert media_id not in [m["id"] for m in r.json()]

    # Serving file now 404
    r = requests.get(f"{API}/files/{storage_path}", timeout=15)
    assert r.status_code == 404


def test_media_missing_source_400(headers):
    r = requests.post(f"{API}/admin/media", headers=headers,
                      json={"title": "x", "category": "weddings"}, timeout=15)
    assert r.status_code == 400


def test_upload_rejects_non_media(headers):
    files = {"file": ("bad.txt", io.BytesIO(b"hello"), "text/plain")}
    r = requests.post(f"{API}/admin/upload", headers=headers, files=files, timeout=30)
    assert r.status_code == 400


# ---- Artist CRUD ----
def test_artist_create_update_delete(headers):
    name = f"TEST_{uuid.uuid4().hex[:6]}"
    r = requests.post(f"{API}/admin/artists", headers=headers,
                      json={"name": name, "category": "Bollywood", "availability": "Available",
                            "bio": "test", "image_url": "https://example.com/x.jpg"}, timeout=15)
    assert r.status_code == 200, r.text
    artist = r.json()
    aid = artist["id"]
    assert artist["name"] == name

    # PATCH availability
    r = requests.patch(f"{API}/admin/artists/{aid}", headers=headers,
                       json={"availability": "On request"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["availability"] == "On request"

    # Verify in list
    r = requests.get(f"{API}/artists", timeout=15)
    found = next((a for a in r.json() if a["id"] == aid), None)
    assert found and found["availability"] == "On request"

    # Delete (soft)
    r = requests.delete(f"{API}/admin/artists/{aid}", headers=headers, timeout=15)
    assert r.status_code == 200

    # Gone from public
    r = requests.get(f"{API}/artists", timeout=15)
    assert aid not in [a["id"] for a in r.json()]

    # Second delete on soft-deleted still returns 200 (record matched, remains soft-deleted)
    r = requests.delete(f"{API}/admin/artists/{aid}", headers=headers, timeout=15)
    assert r.status_code in (200, 404)


def test_files_unknown_path_404():
    r = requests.get(f"{API}/files/vineet-events/uploads/does-not-exist.png", timeout=15)
    assert r.status_code == 404
