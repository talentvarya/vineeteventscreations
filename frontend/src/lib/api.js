import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = "media";

// A row's public URL: uploaded file (storage_path) takes priority over an external image_url
const withUrl = (row) => {
  if (!row) return row;
  let url = row.image_url || "";
  if (row.storage_path) {
    url = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path).data.publicUrl;
  }
  return { ...row, url };
};
const withUrls = (rows) => (rows || []).map(withUrl);

export const mediaSrc = (url) => url || "";

const authError = (message, status = 401) => {
  const err = new Error(message);
  err.response = { status, data: { detail: message } };
  return err;
};

async function uploadToStorage(file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `uploads/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw authError(error.message, 502);
  const kind = file.type.startsWith("video/") ? "video" : "image";
  return {
    storage_path: path,
    kind,
    content_type: file.type,
    url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

async function statsFromEnquiries() {
  const { data, error } = await supabase.from("enquiries").select("status");
  if (error) throw error;
  const counts = { pending: 0, contacted: 0, booked: 0, archived: 0 };
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return { total: data.length, ...counts };
}

async function nextSortOrder(table) {
  const { data } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return data && data.length ? (data[0].sort_order || 0) + 1 : 0;
}

// Minimal axios-compatible client backed by Supabase — keeps every component's
// api.get/post/patch/delete("/path", ...) call sites unchanged.
export const api = {
  get: async (path, config = {}) => {
    const params = config.params || {};

    if (path === "/artists") {
      const { data, error } = await supabase.from("artists").select("*").eq("is_deleted", false).order("created_at");
      if (error) throw error;
      return { data: withUrls(data) };
    }

    if (path === "/media") {
      let q = supabase.from("media").select("*").eq("is_deleted", false);
      if (params.reel) q = q.eq("is_reel", true);
      if (params.category) q = q.eq("category", params.category);
      const { data, error } = await q.order("sort_order");
      if (error) throw error;
      return { data: withUrls(data) };
    }

    if (path === "/testimonials") {
      const { data, error } = await supabase.from("testimonials").select("*").eq("is_deleted", false).order("sort_order");
      if (error) throw error;
      return { data: withUrls(data) };
    }

    if (path === "/auth/me") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw authError("Not authenticated");
      return { data: { id: user.id, email: user.email } };
    }

    if (path === "/admin/enquiries") {
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return { data };
    }

    if (path === "/admin/stats") {
      return { data: await statsFromEnquiries() };
    }

    throw new Error(`Unhandled GET ${path}`);
  },

  post: async (path, body) => {
    if (path === "/enquiries") {
      const { name, phone, email, event_type, event_date, city, budget, message, source } = body;
      const { error } = await supabase.from("enquiries").insert({
        name, phone, email, event_type, event_date, city, budget, message,
        source: source || "website",
      });
      if (error) throw error;
      return { data: { success: true } };
    }

    if (path === "/chat") {
      return {
        data: {
          reply: "Sorry, AI chat abhi is site par configure nahi hai. Aap humein direct call kar sakte hain +91-8588838594 par ya WhatsApp karein.",
        },
      };
    }

    if (path === "/auth/login") {
      const { email, password } = body;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw authError("Invalid email or password");
      return { data: { token: data.session.access_token, user: { id: data.user.id, email: data.user.email } } };
    }

    if (path === "/admin/upload") {
      const file = body.get("file");
      return { data: await uploadToStorage(file) };
    }

    if (path === "/admin/media") {
      const row = {
        title: body.title || "Untitled",
        category: body.category,
        kind: body.kind || "image",
        is_reel: !!body.is_reel,
        storage_path: body.storage_path || null,
        image_url: body.image_url || null,
        sort_order: await nextSortOrder("media"),
      };
      const { data, error } = await supabase.from("media").insert(row).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    if (path === "/admin/testimonials") {
      const row = {
        name: body.name,
        role: body.role || "",
        rating: body.rating || 5,
        text: body.text || "",
        kind: body.storage_path ? "video" : "text",
        storage_path: body.storage_path || null,
        sort_order: await nextSortOrder("testimonials"),
      };
      const { data, error } = await supabase.from("testimonials").insert(row).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    if (path === "/admin/artists") {
      const row = {
        name: body.name,
        category: body.category,
        availability: body.availability,
        bio: body.bio,
        storage_path: body.storage_path || null,
        image_url: body.image_url || null,
      };
      const { data, error } = await supabase.from("artists").insert(row).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    throw new Error(`Unhandled POST ${path}`);
  },

  patch: async (path, body) => {
    let m;

    if ((m = path.match(/^\/admin\/enquiries\/(.+)$/))) {
      const { data, error } = await supabase.from("enquiries").update(body).eq("id", m[1]).select().single();
      if (error) throw error;
      return { data };
    }

    if ((m = path.match(/^\/admin\/media\/(.+)$/))) {
      const { data, error } = await supabase.from("media").update(body).eq("id", m[1]).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    if ((m = path.match(/^\/admin\/testimonials\/(.+)$/))) {
      const patch = { ...body };
      if (patch.storage_path) patch.kind = "video";
      const { data, error } = await supabase.from("testimonials").update(patch).eq("id", m[1]).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    if ((m = path.match(/^\/admin\/artists\/(.+)$/))) {
      const { data, error } = await supabase.from("artists").update(body).eq("id", m[1]).select().single();
      if (error) throw error;
      return { data: withUrl(data) };
    }

    throw new Error(`Unhandled PATCH ${path}`);
  },

  delete: async (path) => {
    let m;

    if ((m = path.match(/^\/admin\/enquiries\/(.+)$/))) {
      const { error } = await supabase.from("enquiries").delete().eq("id", m[1]);
      if (error) throw error;
      return { data: { success: true } };
    }

    if ((m = path.match(/^\/admin\/media\/(.+)$/))) {
      const { error } = await supabase.from("media").update({ is_deleted: true }).eq("id", m[1]);
      if (error) throw error;
      return { data: { success: true } };
    }

    if ((m = path.match(/^\/admin\/testimonials\/(.+)$/))) {
      const { error } = await supabase.from("testimonials").update({ is_deleted: true }).eq("id", m[1]);
      if (error) throw error;
      return { data: { success: true } };
    }

    if ((m = path.match(/^\/admin\/artists\/(.+)$/))) {
      const { error } = await supabase.from("artists").update({ is_deleted: true }).eq("id", m[1]);
      if (error) throw error;
      return { data: { success: true } };
    }

    throw new Error(`Unhandled DELETE ${path}`);
  },
};
