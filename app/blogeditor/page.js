"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import "./blogeditor.css";

// Jangan lupa: paksa dynamic rendering agar Next tidak prerender halaman ini
export const dynamic = "force-dynamic";

// ✅ Dynamic import WYSIWYG (aman untuk SSR)
const WYSIWYGEditor = dynamicImport(() => import("./components/wysiwygeditor"), {
  ssr: false,
});

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Upload cover ke Supabase Storage
async function uploadCover(file) {
  try {
    const fileName = `covers/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error("Upload cover error:", err.message);
    return null;
  }
}

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const [localKey, setLocalKey] = useState("blogeditor_autosave_new");
  const [isPostLoaded, setIsPostLoaded] = useState(false);
  const [hasRestoredAutosave, setHasRestoredAutosave] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [autodraftId, setAutodraftId] = useState(null);

  // 🆕 Counter untuk "Untitled Blog"
  const untitledCountRef = useRef(1);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // ✅ Update localKey saat editId berubah
  useEffect(() => {
    if (editId) {
      setLocalKey(`blogeditor_autosave_${editId}`);
      setAutodraftId(editId);
    } else if (autodraftId) {
      setLocalKey(`blogeditor_autosave_${autodraftId}`);
    } else {
      setLocalKey("blogeditor_autosave_new");
    }
    setIsPostLoaded(false);
    setHasRestoredAutosave(false);
    setIsEditorReady(false);
  }, [editId]);

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

  // ✅ Load daftar draft
  async function loadDrafts() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, cover_url, category, meta_description")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (!error && data) setDrafts(data);
    else if (error) console.error("Gagal load drafts:", error.message);
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  // ✅ Load post (edit mode)
  useEffect(() => {
    async function loadPost() {
      if (!editId) {
        setIsPostLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, cover_url, category, meta_description")
        .eq("id", editId)
        .single();

      if (error) console.error("Gagal load post:", error.message);
      else if (data) {
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category || "Uncategorized");
        setCoverUrl(data.cover_url || "");
        setMetaDescription(data.meta_description || "");
        setAutodraftId(data.id);
      }
      setIsPostLoaded(true);
    }
    loadPost();
  }, [editId]);

  // ✅ Pilih draft dari dropdown
  function handleDraftChange(e) {
    const id = e.target.value;
    setSelectedDraft(id);

    // 🆕 Jika memilih "draft" kosong (kembali ke editor baru)
    if (id === "") {
      setTitle("");
      setCoverUrl("");
      setContent("");
      setMetaDescription("");
      setAutodraftId(null);
      localStorage.removeItem(localKey);
      return;
    }

    const draft = drafts.find((d) => d.id == id);
    if (draft) {
      localStorage.removeItem(localKey);
      // 🆕 Reset isi editor saat draft dipilih
      setTitle("");
      setCoverUrl("");
      setCategory("Uncategorized");
      setContent("");
      setMetaDescription("");
      // 🕒 Delay untuk load data draft (agar terlihat "kosong dulu")
      setTimeout(() => {
        setTitle(draft.title);
        setContent(draft.content);
        setCategory(draft.category || "Uncategorized");
        setCoverUrl(draft.cover_url || "");
        setMetaDescription(draft.meta_description || "");
        setAutodraftId(draft.id);
      }, 300);
    }
  }

  // ✅ AUTOSAVE ke localStorage (termasuk metaDescription)
  useEffect(() => {
    const saveData = () => {
      const data = { title, coverUrl, category, content, metaDescription };
      try {
        localStorage.setItem(localKey, JSON.stringify(data));
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    };
    const intervalId = setInterval(saveData, 1000);
    return () => clearInterval(intervalId);
  }, [title, coverUrl, category, content, metaDescription, localKey]);

  // ✅ RESTORE autosave
  useEffect(() => {
    if (!isPostLoaded || hasRestoredAutosave) return;
    const restoreAutosave = async () => {
      try {
        const saved = localStorage.getItem(localKey);
        if (saved) {
          const data = JSON.parse(saved);
          const hasSignificantContent = data.title || data.content || data.coverUrl || data.metaDescription;
          if (hasSignificantContent) {
            await new Promise((r) => setTimeout(r, 100));
            if (!editId) {
              setTitle(data.title || "");
              setCoverUrl(data.coverUrl || "");
              setCategory(data.category || "Uncategorized");
              setContent(data.content || "");
              setMetaDescription(data.metaDescription || "");
            } else {
              const shouldRestore = window.confirm(
                "Kami menemukan editan yang belum disimpan. Mau memulihkannya?"
              );
              if (shouldRestore) {
                setTitle(data.title || "");
                setCoverUrl(data.coverUrl || "");
                setCategory(data.category || "Uncategorized");
                setContent(data.content || "");
                setMetaDescription(data.metaDescription || "");
              }
            }
          }
        }
        setHasRestoredAutosave(true);
      } catch (err) {
        console.error("Gagal memuat autosave:", err);
        setHasRestoredAutosave(true);
      }
    };
    restoreAutosave();
  }, [localKey, isPostLoaded, hasRestoredAutosave, editId]);

  // ✅ Callback editor siap
  const handleEditorReady = () => setIsEditorReady(true);

  // ✅ Upload cover segera saat file dipilih
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadCover(file);
    if (url) setCoverUrl(url);
  };

  // ✅ AUTODRAFT ke database (termasuk meta_description)
  async function saveDraftToDB() {
    try {
      const payload = {
        title: title?.trim() || "(Tanpa Judul)",
        content,
        status: "draft",
        cover_url: coverUrl || "",
        category: category || "Uncategorized",
        meta_description: metaDescription || "",
      };

      let error, data;
      const targetId = autodraftId || editId;

      if (targetId) {
        ({ error } = await supabase.from("posts").update(payload).eq("id", targetId));
        if (!error) data = { id: targetId };
      } else {
        const response = await supabase.from("posts").insert([payload]).select("id").single();
        error = response.error;
        data = response.data;
      }

      if (error) {
        console.error("Autodraft: gagal simpan:", error.message);
        return null;
      }

      if (data && !autodraftId) setAutodraftId(data.id);
      return data ? data.id : targetId;
    } catch (err) {
      console.error("Autodraft exception:", err);
      return null;
    }
  }

  // ✅ Jalankan interval autodraft
  useEffect(() => {
    if (!isEditorReady || !isPostLoaded) return;
    if (typeof window === "undefined") return;

    let lastSavedTitle = "";
    let lastSavedContent = "";
    let lastSavedMeta = "";

    const runAutodraft = async () => {
      const trimmedTitle = title.trim();
      const strippedContent = content.replace(/<[^>]*>/g, "").trim();
      const strippedMeta = metaDescription.replace(/<[^>]*>/g, "").trim();
      const hasMeaningfulContent = trimmedTitle.length > 0 || strippedContent.length > 0 || strippedMeta.length > 0;
      if (!hasMeaningfulContent) return;

      if (trimmedTitle !== lastSavedTitle || strippedContent !== lastSavedContent || strippedMeta !== lastSavedMeta) {
        const updatedId = await saveDraftToDB();
        if (updatedId) {
          await loadDrafts();
          lastSavedTitle = trimmedTitle;
          lastSavedContent = strippedContent;
          lastSavedMeta = strippedMeta;
        }
      }
    };

    const interval = setInterval(runAutodraft, 10000);
    return () => clearInterval(interval);
  }, [
    !!isEditorReady,
    !!isPostLoaded,
    title || "",
    content || "",
    metaDescription || "",
    coverUrl || "",
    category || "Uncategorized",
    autodraftId || "",
    editId || "",
  ]);

  // ✅ Simpan post (draft/publish) (termasuk meta_description)
  async function savePost(status) {
    const targetIdToUse = editId || autodraftId || null;

    let error;
    if (targetIdToUse) {
      ({ error } = await supabase
        .from("posts")
        .update({
          title,
          content,
          status,
          cover_url: coverUrl || "",
          category,
          meta_description: metaDescription || "",
        })
        .eq("id", targetIdToUse));
    } else {
      ({ error } = await supabase.from("posts").insert([
        { title, content, status, cover_url: coverUrl || "", category, meta_description: metaDescription || "" },
      ]));
    }

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editId || autodraftId ? "Post updated" : `Post saved as ${status}`);
      localStorage.removeItem(localKey);
      if (status === "draft") loadDrafts();
      else {
        if (autodraftId && !editId) setAutodraftId(null);
        router.push("/blog");
      }
    }
  }

  // ✅ Reset editor dengan aman
  const handleWriteNew = () => {
    setTitle("");
    setCoverUrl("");
    setSelectedDraft("");
    setContent("");
    setMetaDescription("");
    setAutodraftId(null);
    localStorage.removeItem(localKey);
    // 🆕 increment untitled counter setiap kali blog baru
    untitledCountRef.current += 1;
    if (editId) router.push("/blogeditor");
  };

  // 🆕 Tentukan label draft saat ini di navbar
  const currentDraftLabel =
    title.trim() !== ""
      ? title.trim()
      : `Untitled Blog #${untitledCountRef.current}`;

  // Meta description char limit for display (you can change)
  const metaCharLimit = 160;
  const metaPlain = metaDescription.replace(/<[^>]+>/g, "");
  const metaCount = metaPlain.length;

  // Bungkus UI dengan Suspense agar Next tidak complain tentang useSearchParams pada prerender
  return (
    <Suspense fallback={null}>
      <div className="blog-editor-wrapper">
        <div className="blog-editor-content">
          {/* ✅ Navbar */}
          <header>
            <div className="nav container">
              <Link href="/" className="logo">
                Editor
              </Link>

              <div className="nav-right">
                <button className="write-blog" onClick={handleWriteNew}>
                  <i className="ri-edit-box-line"></i>
                  <span>Write</span>
                </button>
              </div>

              <div className="nav-right">
                {/* 🆕 Draft dropdown sekarang menampilkan judul blog aktif */}
                <select id="drafts-dropdown" value={selectedDraft} onChange={handleDraftChange}>
                  <option value="">{currentDraftLabel}</option>
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
              <input type="file" accept="image/*" onChange={handleCoverFileChange} />
              <input
                type="text"
                placeholder="Cover Image URL"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-selector"
              >
                <option value="Uncategorized">Uncategorized</option>
                <option value="Business Strategy">Business Strategy</option>
                <option value="Market Research and Analysis">
                  Market Research and Analysis
                </option>
                <option value="Financial Analysis and Modeling">
                  Financial Analysis and Modeling
                </option>
                <option value="Digital Transformation">Digital Transformation</option>
                <option value="Business Process">Business Process</option>
                <option value="Leadership & Organizational Development">
                  Leadership & Organizational Development
                </option>
                <option value="Data Analytics & BI">Data Analytics & BI</option>
                <option value="Reviews">Reviews</option>
                <option value="Personal Insights">Personal Insights</option>
              </select>
            </div>

            {/* ✅ WYSIWYG Editor */}
            <div className="wysiwyg-editor">
              <WYSIWYGEditor
                value={content}
                onChange={(newContent) => setContent(newContent)}
                onEditorReady={handleEditorReady}
              />
            </div>

            {/* 🆕 Meta description mini editor */}
            <div className="meta-description-box" style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Meta Description (ditampilkan di card & meta tag):</label>
              <div className="meta-editor-wrapper" style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
                {/* Re-use WYSIWYGEditor as a mini box; it returns HTML but we strip tags when showing counts */}
                <WYSIWYGEditor
                  value={metaDescription}
                  onChange={(newContent) => setMetaDescription(newContent)}
                  onEditorReady={() => {}}
                />
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: metaCount > metaCharLimit ? "crimson" : "#444" }}>
                {metaCount} characters (recommended ≤ {metaCharLimit})
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Kalau kosong, sistem akan mengambil potongan konten sebagai fallback.
              </div>
            </div>

            {/* ✅ Tombol Draft & Publish */}
            <div className="post-btns" style={{ marginTop: 12 }}>
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
    </Suspense>
  );
}
