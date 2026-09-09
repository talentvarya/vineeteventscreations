from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response, Header, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import logging
import bcrypt
import jwt
import requests
from bson import ObjectId

from emergentintegrations.llm.chat import LlmChat, UserMessage

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

# ---------------- Object Storage ----------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "vineet-events"
storage_key = None

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif",
    "webp": "image/webp", "mp4": "video/mp4", "webm": "video/webm", "mov": "video/quicktime",
}


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def public_url(doc: dict) -> str:
    if doc.get("image_url"):
        return doc["image_url"]
    if doc.get("storage_path"):
        return f"/api/files/{doc['storage_path']}"
    return ""

app = FastAPI(title="Vineet Events Creations API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not ObjectId.is_valid(payload.get("sub", "")):
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EnquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    event_type: Optional[str] = ""
    event_date: Optional[str] = ""
    city: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "website"


class EnquiryUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    city: Optional[str] = None
    budget: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: str
    message: str


class MediaCreate(BaseModel):
    title: str = ""
    category: str = "weddings"
    kind: str = "image"
    is_reel: bool = False
    image_url: Optional[str] = None
    storage_path: Optional[str] = None


class MediaUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    is_reel: Optional[bool] = None
    sort_order: Optional[int] = None


class TestimonialCreate(BaseModel):
    name: str
    role: str = ""
    rating: int = Field(5, ge=1, le=5)
    text: str = ""
    kind: str = "text"
    image_url: Optional[str] = None
    storage_path: Optional[str] = None


class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    text: Optional[str] = None
    image_url: Optional[str] = None
    storage_path: Optional[str] = None


class ArtistCreate(BaseModel):
    name: str
    category: str = "Bollywood"
    availability: str = "Available"
    bio: str = ""
    image_url: Optional[str] = None
    storage_path: Optional[str] = None


class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    availability: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    storage_path: Optional[str] = None


# ---------------- Public routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Vineet Events Creations API running"}


@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryCreate):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.enquiries.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "id": doc["id"], "message": "Enquiry received"}


@api_router.post("/chat")
async def chat(payload: ChatRequest):
    system_message = (
        "You are 'Dhamaka AI', the friendly and energetic virtual assistant for Vineet Events Creations, "
        "a premium event management and entertainment company based in Canal Road, Dehradun, Uttarakhand, India, "
        "with 19+ years of experience serving clients PAN India. "
        "Services offered: Wedding & Event Planning (weddings, Haldi/Mehendi/Sangeet/Cocktail, corporate events, "
        "birthday parties, bride & groom theme entries), Indian Artists (Bollywood & Punjabi dance troops, folk dancers, "
        "live bands & singers, celebrity bookings), International/Russian Artists (Russian belly dancers, welcome girls, "
        "flair bartenders), Mascot & Character Artists (Mickey/Minnie, astronaut, gorilla, panda, superheroes for kids parties), "
        "Special Effects (cold pyro spark fountains, fog/dry ice, CO2 jets, confetti blast, bubble & snow machines, "
        "fire effects, laser shows & projection mapping), and Production & Technical Setup (sound systems, lighting design, "
        "stage decor, DJ services). "
        "Contact: Phone +91-8588838594, WhatsApp +974-71913089, Email vineet.eventsncreations@gmail.com. "
        "Be warm, enthusiastic and use a mix of Hindi and English (Hinglish) when it feels natural. "
        "Answer visitor queries about services, rough pricing guidance (give ballpark ranges and always suggest a free "
        "consultation for exact quotes), venue and artist suggestions. Encourage visitors to share their name, phone, "
        "event type and date so the team can call them back. Keep replies concise (2-4 sentences)."
    )
    try:
        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=payload.session_id,
            system_message=system_message,
        ).with_model("gemini", "gemini-3-flash-preview")

        # Load short history for context
        history = await db.chat_messages.find(
            {"session_id": payload.session_id}
        ).sort("created_at", 1).to_list(20)
        context_prefix = ""
        for h in history[-6:]:
            context_prefix += f"{h['role'].capitalize()}: {h['content']}\n"
        user_text = payload.message
        if context_prefix:
            user_text = f"Recent conversation:\n{context_prefix}\nUser: {payload.message}"

        reply = await chat_client.send_message(UserMessage(text=user_text))
        reply_text = reply if isinstance(reply, str) else str(reply)

        now = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_many([
            {"session_id": payload.session_id, "role": "user", "content": payload.message, "created_at": now},
            {"session_id": payload.session_id, "role": "assistant", "content": reply_text, "created_at": now},
        ])
        return {"reply": reply_text}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"reply": "Sorry, thodi technical dikkat aa gayi! Aap humein direct call kar sakte hain +91-8588838594 par ya WhatsApp karein."}


# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    return {"token": token, "user": {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


# ---------------- Admin routes ----------------
@api_router.get("/admin/enquiries")
async def list_enquiries(user: dict = Depends(get_current_user)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    items = await db.enquiries.find({}, {"_id": 0}).to_list(2000)
    total = len(items)
    counts = {"pending": 0, "contacted": 0, "booked": 0, "archived": 0}
    for it in items:
        st = it.get("status", "pending")
        counts[st] = counts.get(st, 0) + 1
    return {"total": total, **counts}


@api_router.patch("/admin/enquiries/{enquiry_id}")
async def update_enquiry(enquiry_id: str, payload: EnquiryUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = await db.enquiries.update_one({"id": enquiry_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    doc = await db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, user: dict = Depends(get_current_user)):
    result = await db.enquiries.delete_one({"id": enquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"success": True}


# ---------------- Media (public read) ----------------
@api_router.get("/media")
async def list_media(category: Optional[str] = None, reel: Optional[bool] = None):
    q = {"is_deleted": {"$ne": True}}
    if category and category != "all":
        q["category"] = category
    if reel is not None:
        q["is_reel"] = reel
    items = await db.media.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).to_list(500)
    for it in items:
        it["url"] = public_url(it)
    return items


@api_router.get("/artists")
async def list_artists(category: Optional[str] = None):
    q = {"is_deleted": {"$ne": True}}
    if category and category != "all":
        q["category"] = category
    items = await db.artists.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        it["url"] = public_url(it)
    return items


@api_router.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({"is_deleted": {"$ne": True}}, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).to_list(500)
    for it in items:
        it["url"] = public_url(it)
    return items


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.media.find_one({"storage_path": path, "is_deleted": {"$ne": True}})
    if not record:
        record = await db.artists.find_one({"storage_path": path, "is_deleted": {"$ne": True}})
    if not record:
        record = await db.testimonials.find_one({"storage_path": path, "is_deleted": {"$ne": True}})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=record.get("content_type", content_type),
                    headers={"Cache-Control": "public, max-age=86400"})


# ---------------- Admin: upload + media + artists ----------------
@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    content_type = file.content_type or MIME_TYPES.get(ext, "application/octet-stream")
    if not (content_type.startswith("image/") or content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Only image or video files are allowed")
    data = await file.read()
    if len(data) > 60 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 60MB)")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload failed. Please try again.")
    kind = "video" if content_type.startswith("video/") else "image"
    return {"storage_path": result["path"], "content_type": content_type, "kind": kind,
            "url": f"/api/files/{result['path']}"}


@api_router.post("/admin/media")
async def create_media(payload: MediaCreate, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    if not doc.get("image_url") and not doc.get("storage_path"):
        raise HTTPException(status_code=400, detail="Provide an uploaded file or image URL")
    doc["id"] = str(uuid.uuid4())
    doc["is_deleted"] = False
    doc["content_type"] = "video/mp4" if doc.get("kind") == "video" else "image/jpeg"
    last = await db.media.find({}, {"sort_order": 1}).sort("sort_order", -1).limit(1).to_list(1)
    doc["sort_order"] = (last[0].get("sort_order", 0) + 1) if last else 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    doc["url"] = public_url(doc)
    return doc


@api_router.patch("/admin/media/{media_id}")
async def update_media(media_id: str, payload: MediaUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = await db.media.update_one({"id": media_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    doc = await db.media.find_one({"id": media_id}, {"_id": 0})
    doc["url"] = public_url(doc)
    return doc


@api_router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, user: dict = Depends(get_current_user)):
    result = await db.media.update_one({"id": media_id, "is_deleted": {"$ne": True}}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}


# ---------------- Admin: testimonials ----------------
@api_router.post("/admin/testimonials")
async def create_testimonial(payload: TestimonialCreate, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["is_deleted"] = False
    doc["content_type"] = "video/mp4" if doc.get("kind") == "video" else "image/jpeg"
    last = await db.testimonials.find({}, {"sort_order": 1}).sort("sort_order", -1).limit(1).to_list(1)
    doc["sort_order"] = (last[0].get("sort_order", 0) + 1) if last else 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    doc["url"] = public_url(doc)
    return doc


@api_router.patch("/admin/testimonials/{tid}")
async def update_testimonial(tid: str, payload: TestimonialUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    if update.get("storage_path"):
        update["kind"] = "video"
        update["content_type"] = "video/mp4"
    result = await db.testimonials.update_one({"id": tid}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    doc = await db.testimonials.find_one({"id": tid}, {"_id": 0})
    doc["url"] = public_url(doc)
    return doc


@api_router.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, user: dict = Depends(get_current_user)):
    result = await db.testimonials.update_one({"id": tid, "is_deleted": {"$ne": True}}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True}


@api_router.post("/admin/artists")
async def create_artist(payload: ArtistCreate, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["is_deleted"] = False
    doc["content_type"] = "image/jpeg"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.artists.insert_one(doc)
    doc.pop("_id", None)
    doc["url"] = public_url(doc)
    return doc


@api_router.patch("/admin/artists/{artist_id}")
async def update_artist(artist_id: str, payload: ArtistUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = await db.artists.update_one({"id": artist_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    doc = await db.artists.find_one({"id": artist_id}, {"_id": 0})
    doc["url"] = public_url(doc)
    return doc


@api_router.delete("/admin/artists/{artist_id}")
async def delete_artist(artist_id: str, user: dict = Depends(get_current_user)):
    result = await db.artists.update_one({"id": artist_id, "is_deleted": {"$ne": True}}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    return {"success": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Vineet Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

    await seed_content()


async def seed_content():
    now = datetime.now(timezone.utc).isoformat()
    if await db.media.count_documents({}) == 0:
        gallery = [
            ("Royal Mandap Wedding", "weddings", "https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Grand Ballroom Ceremony", "weddings", "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Destination Wedding Setup", "weddings", "https://images.unsplash.com/photo-1726068449701-4e11c5d64b11?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Bollywood Dance Troop", "indian", "https://images.unsplash.com/photo-1762363018649-6dde58bd568b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Folk & Sufi Performance", "indian", "https://images.unsplash.com/photo-1712192682756-ae5b3a8e7508?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Russian Belly Dancers", "international", "https://images.unsplash.com/photo-1574155376612-bfa4ed8aabfd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Character Mascot Fun", "mascots", "https://images.unsplash.com/photo-1765947381344-12d491447d4f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Cold Pyro Spark Fountains", "pyro", "https://images.unsplash.com/photo-1578850141295-7fb35c301da6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Fire & Fog Entry", "pyro", "https://images.unsplash.com/photo-1535087419977-e933e68008ba?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Confetti Blast Finale", "pyro", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Concert Stage & Lights", "soundlight", "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Live DJ Night", "soundlight", "https://images.unsplash.com/photo-1571266028243-d220c6a7edbf?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
            ("Laser Light Show", "soundlight", "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
        ]
        docs = []
        for i, (title, cat, url) in enumerate(gallery):
            docs.append({"id": str(uuid.uuid4()), "title": title, "category": cat, "kind": "image",
                         "is_reel": i < 6, "image_url": url, "storage_path": None, "sort_order": i,
                         "content_type": "image/jpeg", "is_deleted": False, "created_at": now})
        await db.media.insert_many(docs)
        logger.info("Seeded media gallery")

    if await db.artists.count_documents({}) == 0:
        artists = [
            ("Aisha & Troupe", "Bollywood", "Available on weekends", "High-energy Bollywood dance troupe for sangeet & receptions.", "https://static.prod-images.emergentagent.com/jobs/4e75141e-4909-452f-9c60-5a2e76b95eb9/images/838f8e6386471e777a88d2c9166c068a32d81d445bd09260ae41f7a69b458888.jpeg"),
            ("Bhangra Beats Crew", "Bhangra", "Available", "Punjabi Bhangra performers with live dhol for grand entries.", "https://static.prod-images.emergentagent.com/jobs/4e75141e-4909-452f-9c60-5a2e76b95eb9/images/3a0bbf57d0f96c89970eb486a5b84207fa4a59d254333d4d8f409e8a1ac72192.jpeg"),
            ("Natasha", "Russian / International", "On request", "International belly dancer & welcome performer for luxury events.", "https://static.prod-images.emergentagent.com/jobs/4e75141e-4909-452f-9c60-5a2e76b95eb9/images/6f2bde303a2b65425c2fed83274da3cf7bb95263c68657a32de0a74715c51ef3.jpeg"),
            ("DJ Vibe", "DJ", "Available", "Professional DJ for sangeet nights, cocktails & club sets.", "https://static.prod-images.emergentagent.com/jobs/4e75141e-4909-452f-9c60-5a2e76b95eb9/images/55bc6cc1ae17b4263851590c76268d31f2ae82077331333943d533d7f0574c69.jpeg"),
            ("The Live Collective", "Live Band", "Available on weekends", "Live band & vocalists for a soulful reception atmosphere.", "https://static.prod-images.emergentagent.com/jobs/4e75141e-4909-452f-9c60-5a2e76b95eb9/images/8eab19b28843286ede7770bfc54c88f972b3d9f3621081e4eb30b5a1608f400a.jpeg"),
            ("Fun Mascots Co.", "Mascot", "Available", "Cartoon & animal mascots for kids birthdays & theme parties.", "https://images.unsplash.com/photo-1765947381344-12d491447d4f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"),
        ]
        docs = []
        for name, cat, avail, bio, url in artists:
            docs.append({"id": str(uuid.uuid4()), "name": name, "category": cat, "availability": avail,
                         "bio": bio, "image_url": url, "storage_path": None,
                         "content_type": "image/jpeg", "is_deleted": False, "created_at": now})
        await db.artists.insert_many(docs)
        logger.info("Seeded artists")

    if await db.testimonials.count_documents({}) == 0:
        testimonials = [
            ("Ananya & Rohit Sharma", "Wedding, Dehradun", 5, "Vineet ji ne humari shaadi ko ek sapne jaisa bana diya! Cold pyro entry aur Russian dancers ne sabko hila diya. Truly dhamakedar!"),
            ("Karan Mehta", "Corporate Gala, Delhi NCR", 5, "Flawless production, world-class sound & lighting. Our annual conference felt like a concert. Highly professional team."),
            ("Priya Nautiyal", "Kids Birthday, Dehradun", 5, "Mickey aur Minnie mascots ne bachchon ka din bana diya. Decor, cake, games — sab kuch perfect tha. Thank you team!"),
            ("Sahil & Neha", "Sangeet Night, Jaipur", 5, "Bollywood dance troop + live DJ = full paisa vasool. The confetti blast during our first dance was magical."),
            ("Vikram Singh", "Destination Wedding, Goa", 5, "19 years of experience clearly shows. Every detail managed to perfection across two states. Grand & royal indeed."),
        ]
        docs = []
        for i, (name, role, rating, text) in enumerate(testimonials):
            docs.append({"id": str(uuid.uuid4()), "name": name, "role": role, "rating": rating, "text": text,
                         "kind": "text", "image_url": None, "storage_path": None, "sort_order": i,
                         "content_type": "image/jpeg", "is_deleted": False, "created_at": now})
        await db.testimonials.insert_many(docs)
        logger.info("Seeded testimonials")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
