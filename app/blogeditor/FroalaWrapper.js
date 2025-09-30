"use client";
import { useEffect, useRef } from "react";

export default function FroalaWrapper({ onReady }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function initFroala() {
      if (!containerRef.current) return;

      if (
        containerRef.current.querySelector(".fr-wrapper") ||
        editorRef.current
      ) {
        console.log("Froala: already initialized, skipping.");
        return;
      }

      const mod = await import("froala-editor/js/froala_editor.pkgd.min.js");
      const FroalaEditor = mod.default || window.FroalaEditor;

      if (!mounted || !FroalaEditor) return;

      containerRef.current.innerHTML = "";

      editorRef.current = new FroalaEditor(containerRef.current, {
        placeholderText: "Tulis artikel kamu di sini...",
        height: 400,
        toolbarInline: false,

        // 🔥 Konfigurasi upload gambar
        imageUpload: true,
        imageUploadURL: "/api/upload", // route API Next.js
        imageUploadParam: "file",
        imageAllowedTypes: ["jpeg", "jpg", "png", "gif", "webp"],

        events: {
          initialized() {
            console.log("Froala ready ✅");
            if (typeof onReady === "function") {
              onReady(editorRef.current);
            }
          },
          focus() {
            console.log("Editor focus ✍️");
          },
          "image.error"(error, response) {
            console.error("Image upload error:", error, response);
          },
        },
      });
    }

    initFroala();

    return () => {
      mounted = false;
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying Froala:", e);
        }
        editorRef.current = null;
      }
    };
  }, [onReady]);

  return (
    <div>
      <div id="froala-editor-container" ref={containerRef}></div>
    </div>
  );
}