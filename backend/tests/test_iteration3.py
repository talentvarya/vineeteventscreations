"""Iteration 3 tests: testimonials, media reordering (sort_order), reel video filter, admin auth."""
import io
import os
import struct
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


# ---------- Public testimonials ----------
def test_public_testimonials_seeded():
    r = requests.get(f"{API}/testimonials", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 5
    t = data[0]
    for k in ["id", "name", "role", "rating", "text", "kind", "url"]:
        assert k in t
    # No _id leaked
    assert "_id" not in t


# ---------- Admin auth protection ----------
@pytest.mark.parametrize("method,path", [
    ("POST", "/admin/testimonials"),
    ("DELETE", "/admin/testimonials/xyz"),
    ("PATCH", "/admin/media/xyz"),
])
def test_admin_endpoints_require_auth(method, path):
    r = requests.request(method, f"{API}{path}", timeout=15,
                         json={} if method in ("POST", "PATCH") else None)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


# ---------- Testimonials create/get/delete ----------
def test_create_and_delete_testimonial(headers):
    name = f"TEST_{uuid.uuid4().hex[:6]}"
    payload = {"name": name, "role": "Wedding, Dehradun", "rating": 4,
               "text": "Great service!", "kind": "text"}
    r = requests.post(f"{API}/admin/testimonials", headers=headers, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    doc = r.json()
    tid = doc["id"]
    assert doc["name"] == name
    assert doc["rating"] == 4
    assert doc["kind"] == "text"
    assert "_id" not in doc

    # Public list contains it
    r = requests.get(f"{API}/testimonials", timeout=15)
    ids = [t["id"] for t in r.json()]
    assert tid in ids

    # Delete
    r = requests.delete(f"{API}/admin/testimonials/{tid}", headers=headers, timeout=15)
    assert r.status_code == 200

    # Gone
    r = requests.get(f"{API}/testimonials", timeout=15)
    assert tid not in [t["id"] for t in r.json()]

    # Second delete -> 404
    r = requests.delete(f"{API}/admin/testimonials/{tid}", headers=headers, timeout=15)
    assert r.status_code == 404


# ---------- Media PATCH sort_order & sorted list ----------
def test_media_list_sorted_by_sort_order():
    r = requests.get(f"{API}/media", timeout=15)
    assert r.status_code == 200
    data = r.json()
    orders = [m.get("sort_order", 0) for m in data]
    assert orders == sorted(orders), f"Media not sorted asc by sort_order: {orders}"


def test_patch_media_reorder_persists(headers):
    r = requests.get(f"{API}/media", timeout=15)
    items = r.json()
    assert len(items) >= 2
    a, b = items[0], items[1]
    orig_a = a["sort_order"]
    orig_b = b["sort_order"]

    # Swap
    r1 = requests.patch(f"{API}/admin/media/{a['id']}", headers=headers,
                       json={"sort_order": orig_b}, timeout=15)
    assert r1.status_code == 200, r1.text
    assert r1.json()["sort_order"] == orig_b

    r2 = requests.patch(f"{API}/admin/media/{b['id']}", headers=headers,
                       json={"sort_order": orig_a}, timeout=15)
    assert r2.status_code == 200

    # Verify persisted
    r = requests.get(f"{API}/media", timeout=15)
    items2 = {m["id"]: m for m in r.json()}
    assert items2[a["id"]]["sort_order"] == orig_b
    assert items2[b["id"]]["sort_order"] == orig_a

    # Restore original
    requests.patch(f"{API}/admin/media/{a['id']}", headers=headers, json={"sort_order": orig_a}, timeout=15)
    requests.patch(f"{API}/admin/media/{b['id']}", headers=headers, json={"sort_order": orig_b}, timeout=15)


def test_patch_media_title_category_is_reel(headers):
    r = requests.get(f"{API}/media", timeout=15)
    mid = r.json()[0]["id"]
    orig = r.json()[0]
    new_title = f"TEST_TITLE_{uuid.uuid4().hex[:5]}"
    r = requests.patch(f"{API}/admin/media/{mid}", headers=headers,
                       json={"title": new_title, "is_reel": not orig.get("is_reel", False)},
                       timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["title"] == new_title
    assert d["is_reel"] != orig.get("is_reel", False)
    # Restore
    requests.patch(f"{API}/admin/media/{mid}", headers=headers,
                   json={"title": orig.get("title", ""), "is_reel": orig.get("is_reel", False)}, timeout=15)


def test_patch_media_nonexistent(headers):
    r = requests.patch(f"{API}/admin/media/nonexistent", headers=headers, json={"sort_order": 5}, timeout=15)
    assert r.status_code == 404


# ---------- Video upload + reel filter ----------
# Minimal valid-ish mp4 bytes (ftyp box). The endpoint validates by content-type, not deep parsing.
def _tiny_mp4():
    ftyp = b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2avc1mp41"
    mdat = b"\x00\x00\x00\x08mdat"
    return ftyp + mdat


def test_upload_video_returns_kind_video(headers):
    files = {"file": ("test.mp4", io.BytesIO(_tiny_mp4()), "video/mp4")}
    r = requests.post(f"{API}/admin/upload", headers=headers, files=files, timeout=60)
    assert r.status_code == 200, r.text
    up = r.json()
    assert up["kind"] == "video"
    assert up["content_type"].startswith("video/")
    storage_path = up["storage_path"]

    # Create reel media
    r = requests.post(f"{API}/admin/media", headers=headers, json={
        "title": f"TEST_REEL_{uuid.uuid4().hex[:5]}",
        "category": "weddings", "kind": "video", "is_reel": True,
        "storage_path": storage_path,
    }, timeout=15)
    assert r.status_code == 200, r.text
    media_id = r.json()["id"]
    assert r.json()["kind"] == "video"
    assert r.json()["is_reel"] is True

    # /api/media?reel=true includes it
    r = requests.get(f"{API}/media", params={"reel": "true"}, timeout=15)
    reel_items = r.json()
    assert media_id in [m["id"] for m in reel_items]
    # All are videos or images marked reel; specifically ours is video
    ours = next(m for m in reel_items if m["id"] == media_id)
    assert ours["kind"] == "video"
    assert ours["is_reel"] is True

    # Cleanup
    requests.delete(f"{API}/admin/media/{media_id}", headers=headers, timeout=15)


# ---------- /api/files serves testimonial paths ----------
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?"
    b"\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_files_serves_testimonial_path(headers):
    # Upload an image
    files = {"file": ("t.png", io.BytesIO(PNG_1x1), "image/png")}
    r = requests.post(f"{API}/admin/upload", headers=headers, files=files, timeout=30)
    assert r.status_code == 200
    storage_path = r.json()["storage_path"]

    # Create testimonial pointing to it
    r = requests.post(f"{API}/admin/testimonials", headers=headers, json={
        "name": f"TEST_{uuid.uuid4().hex[:5]}", "role": "Client", "rating": 5,
        "text": "video review", "kind": "video", "storage_path": storage_path,
    }, timeout=15)
    assert r.status_code == 200
    tid = r.json()["id"]
    assert r.json()["url"] == f"/api/files/{storage_path}"

    # Serve
    r = requests.get(f"{API}/files/{storage_path}", timeout=30)
    assert r.status_code == 200
    assert len(r.content) > 0

    # Cleanup
    requests.delete(f"{API}/admin/testimonials/{tid}", headers=headers, timeout=15)

    # After soft-delete, /api/files should 404
    r = requests.get(f"{API}/files/{storage_path}", timeout=15)
    assert r.status_code == 404
