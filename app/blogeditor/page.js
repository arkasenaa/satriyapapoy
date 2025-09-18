"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "./blogeditor.css";

// ✅ Dynamic import CKEditor 5 (agar SSR aman di Next.js)
const CKEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic")).default;
    return (props) => <CKEditor editor={ClassicEditor} {...props} />;
  },
  { ssr: false }
);

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

// ✅ Upload adapter CKEditor → Supabase Storage
class SupabaseUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    const fileName = `uploads/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new Error("Upload error: " + error.message);
    }

    const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    return { default: data.publicUrl };
  }

  abort() {}
}

// ✅ Plugin adapter untuk CKEditor
function SupabaseUploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new SupabaseUploadAdapter(loader);
  };
}

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [category, setCategory] = useState("Uncategorized");
  const [content, setContent] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const router = useRouter();

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
      .select("id, title, content, cover_url, category")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (!error) setDrafts(data);
  }

  function handleDraftChange(e) {
  const id = e.target.value;
  setSelectedDraft(id);

  const draft = drafts.find((d) => d.id == id);
  if (draft) {
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category || "Uncategorized"); // ✅ load category
  }
}

  useEffect(() => {
    loadDrafts();
  }, []);

  // save post (draft/publish)
  async function savePost(status) {
    let uploadedCoverUrl = coverUrl;

    if (coverFile) {
      uploadedCoverUrl = await uploadCover(coverFile);
    }

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        status,
        cover_url: uploadedCoverUrl,
        category,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Post saved as " + status);
      if (status === "draft") {
        loadDrafts();
      } else {
        router.push("/blog");
      }
    }
  }

  // load draft ke editor
  function handleDraftChange(e) {
    const id = e.target.value;
    setSelectedDraft(id);

    const draft = drafts.find((d) => d.id == id);
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
    }
  }

  return (
    <div className="blog-editor-wrapper">
      <div className="blog-editor-content">
        <header>
        <div className="nav container">
          <a href="#" className="logo">Editor</a>
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
          <select
            value={category}
            placeholder="Category"
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

        {/* ✅ CKEditor 5 */}
        <div className="ck-editor">
        <CKEditor
          config={{
            extraPlugins: [SupabaseUploadPlugin],
            toolbar: [
              "heading",
              "|",
              "fontSize", "fontFamily", "bold", "italic", "underline",
              "|",
              "link", "imageUpload", "mediaEmbed", "blockQuote", "undo", "redo"
            ],
            fontSize: {
              options: [
                8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36
              ]
            },
          }}
          data={content}
          onChange={(event, editor) => {
            setContent(editor.getData());
          }}
        />
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

