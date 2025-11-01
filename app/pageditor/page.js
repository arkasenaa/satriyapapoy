"use client";
import { useState, useEffect, useRef, Suspense} from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import dynamicImport from "next/dynamic";
import "./pageditor.css";

export const dynamic = "force-dynamic"; 

const WYSIWYGeditor = dynamicImport(() => import("./components/wysiwygeditor"), {
    ssr: false,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function uploadLogo(file) {
    try {
        const fileName = `Logo/${Date.now()}-${file.name}`;
        const { error: uploadError} = await supabase.storage
            .from("Brand-Logo")
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true,
            })

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from ("Brand-Logo").getPublicUrl(fileName);
        return data.publicUrl;
    } catch (err) {
        console.error("Upload logo error:", err.message);
        return null;
    }
}

export default function PageEditor() {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState ("");
    const [content, setContent] = useState ("");
    const [logoUrl, setLogoUrl] = useState ("");
    const [isSaving, setIsSaving] = useState (false);
    const [lastSaved, setLastSaved] = useState (null);
    const [hasRestored, setHasRestored] = useState (false);
    const [autoSaveTimer, setAutoSaveTimer] = useState (null);

    const localkey = `pageeditor_autosave_${selectedPage || "new"}`;

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push(`/login?redirect=${pathname}`);
      }
    }
    checkSession();
  }, [pathname]);


    useEffect(() => {
        async function fetchpages() {
            const { data, error } = await supabase.from("pages").select("id, page_name, content, logo_url ");
            if (data) setPages(data);
            if (error) console.error("Fetch pages error:", error.message);
        }
        fetchpages();
    }, []);

    useEffect(() => {
        if(!selectedPage) return;
        const page = pages.find((p) => p.id === parseInt(selectedPage));
        if (page) {
            setContent(page.content || "");
            setLogoUrl(page.logo_url || "");
        }
    }, [selectedPage]);

    useEffect(() => {
        if (!hasRestored && selectedPage) {
            const savedData = localStorage.getItem(localkey);
            if (savedData) {
                const { content, logoUrl } = JSON.parse(savedData);
                setContent(content);
                setLogoUrl(logoUrl);
            }
            setHasRestored(true);
        }
    }, [selectedPage]);

    useEffect(() => {
        if (!selectedPage) return;
        if (autoSaveTimer) clearTimeout(autoSaveTimer);

        const timer = setTimeout(() => {
            localStorage.setItem(localkey, JSON.stringify({ content, logoUrl }));
            setLastSaved(new Date().toLocaleTimeString());
            console.log("Autosaved:", localkey);
        }, 3000);

        setAutoSaveTimer(timer);
        return () => clearTimeout(timer);
    }, [content, logoUrl, selectedPage]);

    async function handleLogoChange(e){
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from ("logos")
            .upload (fileName, file);
        if (error) {
            console.error ("failed to load logo:", error);
            return;
        }
        const { data: publicUrlData } = supabase.storage
            .from ("logos")
            .getPublicUrl(fileName);
        const publicUrl = publicUrlData.publicUrl;
        setLogoUrl(publicUrl);
        if (selectedPage) {
            await supabase
                .from ("pages")
                .update({logo_url:publicUrl})
                .eq("id", selectedPage);
        }
        console.log("logo successfully updated:", publicUrl);
    }

    async function handleSaveToServer() {
        if (!selectedPage) return alert("pilih page terlebih dahulu!!!");
        setIsSaving (true);

        try {
            const { error } = await supabase 
                .from("pages")
                .update({
                    content: content,
                    logo_url: logoUrl,
                    uploaded_at: new Date ()
                })
                .eq("id", selectedPage);

            if (error) {
                console.error("Error saving:", error.message);
                alert("failed to store to server.");
            } else {
                localStorage.removeItem(localkey);
                setLastSaved(new Date().toLocaleTimeString());
                alert("page successfully stored to server.");
            }
        } catch (err) {
            console.error("Save error:", err.message);
        }
        setIsSaving(false);
    } 
    return (
        <div className="page-editor">
            <div className="nav container">
                <h2>Page Editor</h2>
            </div>
        <div className="selector">
            <label>Pilih page:</label>
            <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}>
                    <option value="">-- Pilih Page --</option>
                    {pages.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.page_name}
                        </option>
                    ))}
                </select>
        </div>
        <div className="logo-uploader">
            <label>Logo:</label>
            <input type="file" onChange={handleLogoChange} />
            {logoUrl && <img src={logoUrl} alt="Logo-Preview" width={150} />}
        </div>
        <div className="editor-section">
            <Suspense fallback={<p>memuat editor...</p>}>
                    <WYSIWYGeditor value={content} onChange={setContent} />
            </Suspense>
        </div>
        <div className="status-bar">
            <p>Autosave terakhir: {lastSaved || "belum tersimpan"}</p>
        </div>
        <button disabled={isSaving} onClick={handleSaveToServer}>
            {isSaving ? "Saving..." : "Simpan ke Server"}
        </button>
        </div>
    )
}