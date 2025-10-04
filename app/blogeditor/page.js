"use client";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import "./blogeditor.css";

// ✅ Dynamic import WYSIWYG (SSR aman)
const WYSIWYGEditor = dynamic(() => import("./components/wysiwygeditor"), {
  ssr: false,
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Upload cover ke Supabase Storage
async function uploadCover(file) {
  const fileName = `covers/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload cover error:", uploadError.message);
    return null;
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
  return data.publicUrl;
}

// 🔹 Komponen inti blog editor (pakai Suspense wrapper)
function BlogEditorContent() {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [category, setCategory] = useState("Uncategorized");
  const [content, setContent] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // ✅ Cek session login
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push(`/login?redirect=${pathname}`);
      }
    }
    checkSession();
  }, [pathname, router]);

  // ✅ Load drafts
  async function loadDrafts() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, cover_url, category")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDrafts(data);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  // ✅ Load post untuk mode edit
  useEffect(() => {
    async function loadPost() {
      if (!editId) return;

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, cover_url, category")
        .eq("id", editId)
        .single();

      if (error) {
        console.error("Gagal load post:", error.message);
      } else if (data) {
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category || "Uncategorized");
        setCoverUrl(data.cover_url || "");
      }
    }

    loadPost();
  }, [editId]);

  // ✅ Handle draft selector
  function handleDraftChange(e) {
    const id = e.target.value;
    setSelectedDraft(id);

    const draft = drafts.find((d) => d.id == id);
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setCategory(draft.category || "Uncategorized");
      setCoverUrl(draft.cover_url || "");
    }
  }

  // ✅ Save post (draft/publish)
  async function savePost(status) {
    let uploadedCoverUrl = coverUrl;

    if (coverFile) {
      uploadedCoverUrl = await uploadCover(coverFile);
    }

    let error;

    if (editId) {
      // mode update
      ({ error } = await supabase
        .from("posts")
        .update({
          title,
          content,
          status,
          cover_url: uploadedCoverUrl,
          category,
        })
        .eq("id", editId));
    } else {
      // mode insert baru
      ({ error } = await supabase.from("posts").insert([
        {
          title,
          content,
          status,
          cover_url: uploadedCoverUrl,
          category,
        },
      ]));
    }

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editId ? "Post updated" : "Post saved as " + status);
      if (status === "draft") {
        loadDrafts();
      } else {
        router.push("/blog");
      }
    }
  }

  return (
    <div className="blog-editor-wrapper">
      <div className="blog-editor-content">
        {/* ✅ Navbar */}
        <header>
          <div className="nav container">
            {/* ✅ Logo menuju halaman utama */}
            <Link href="/" className="logo">
              Editor
            </Link>

            <div className="nav-right">
              <button
                className="write-blog"
                onClick={() => {
                  setTitle("");
                  setCoverUrl("");
                  setCoverFile(null);
                  setSelectedDraft("");
                  setContent("");
                }}
              >
                <i className="ri-edit-box-line"></i>
                <span>Write</span>
              </button>
            </div>

            <div className="nav-right">
              <select
                id="drafts-dropdown"
                value={selectedDraft}
                onChange={handleDraftChange}
              >
                <option value="">Drafts</option>
                {drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* ✅ Form Editor */}
        <section className="post-create container">
          <div className="post-inputs">
            {/* Upload cover dari komputer */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCoverFile(file);
              }}
            />
            {/* Input cover URL */}
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
            {/* Input kategori */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-selector"
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="Business Strategy">Business Strategy</option>
              <option value="Market Research and Analysis">Market Research and Analysis</option>
              <option value="Financial Analysis and Modeling">Financial Analysis and Modeling</option>
              <option value="Digital Transformation">Digital Transformation</option>
              <option value="Business Process">Business Process</option>
              <option value="Leadership & Organizational Development">Leadership & Organizational Development</option>
              <option value="Data Analytics & BI">Data Analytics & BI</option>
              <option value="Reviews">Reviews</option>
              <option value="Personal Insights">Personal Insights</option>
            </select>
          </div>

          {/* ✅ WYSIWYG Editor */}
          <div className="wysiwyg-editor">
            <WYSIWYGEditor value={content} onChange={setContent} />
          </div>

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
    </div>
  );
}

// 🔹 Ekspor utama dibungkus Suspense
export default function BlogEditor() {
  return (
    <Suspense fallback={<p>Loading editor...</p>}>
      <BlogEditorContent />
    </Suspense>
  );
}
