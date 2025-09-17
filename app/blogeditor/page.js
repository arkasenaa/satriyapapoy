"use client";
import { useEffect, useState, useCallback } from "react";   // ⬅️ tambahkan useCallback
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import "./blogeditor.css";

const FroalaWrapper = dynamic(() => import("./FroalaWrapper"), { ssr: false });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Tambahkan fungsi ini
async function uploadCover(file) {
  const fileName = `covers/${Date.now()}-${file.name}`;

  // Upload ke Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("blog-images") // bucket harus sesuai dengan yang ada di Supabase
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true, // supaya overwrite kalau nama sama
    });

  if (uploadError) {
    console.error("Upload cover error:", uploadError.message);
    return null;
  }

  // Ambil public URL
  const { data } = supabase.storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const router = useRouter();

  // ✅ bikin handler editor siap pakai
  const handleReady = useCallback((editorInstance) => {
    setEditor(editorInstance);
  }, []);

  // cek login user
  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  // load drafts
  async function loadDrafts() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, cover_url")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (!error) setDrafts(data);
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  // save post (draft/publish)
  async function savePost(status) {
  const content = editor ? editor.html.get() : "";

  let uploadedCoverUrl = coverUrl; // default dari input teks

  if (coverFile) {
    uploadedCoverUrl = await uploadCover(coverFile);
  }

  const { error } = await supabase.from("posts").insert([
    {
      title,
      content,
      status,
      cover_url: uploadedCoverUrl,
    },
  ]);

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Post saved as " + status);
    if (status === "draft") {
      loadDrafts();
    } else {
      router.push("/blog");  // ✅ redirect setelah publish
    }
  }
}

  // load draft ke editor
  function handleDraftChange(e) {
    const id = e.target.value;
    setSelectedDraft(id);

    const draft = drafts.find((d) => d.id == id);
    if (draft && editor) {
      setTitle(draft.title);
      editor.html.set(draft.content);
    }
  }

  return (
    <div>
      <header>
        <div className="nav container">
          <a href="#" className="logo">Editor</a>
          <div className="nav-right">
            <button className="write-blog">
              <i className="ri-edit-box-line"></i>
              <span>Write</span>
            </button>
          </div>
          <div className="nav-right">
            <select id="drafts-dropdown" value={selectedDraft} onChange={handleDraftChange}>
              <option value="">Drafts</option>
              {drafts.map((draft) => (
                <option key={draft.id} value={draft.id}>{draft.title}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="post-create container">
  <div className="post-inputs">
  {/* Upload cover dari komputer */}
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setCoverFile(file);
  }}
  />
  {/* ✅ Tambahkan input cover */}
  <input
    type="text"
    placeholder="Cover Image URL"
    value={coverUrl}
    onChange={(e) => setCoverUrl(e.target.value)}
  />

  {/* Input judul */}
  <input
    type="text"
    placeholder="Blog Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
</div>
  {/* Editor */}
  <FroalaWrapper onReady={handleReady} />

  {/* Tombol Draft & Publish */}
  <div className="post-btns">
    <button onClick={() => savePost("draft")} className="write-blog draft">
      <i className="ri-edit-box-line"></i>
      <span>Draft</span>
    </button>
    <button onClick={() => savePost("published")} className="publish">
      Publish
    </button>
  </div>
</section>
    </div>
  );
}
