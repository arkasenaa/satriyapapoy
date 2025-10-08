  "use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Indent, Outdent,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video, Eraser, Link as LinkIcon,
  Pilcrow // ikon paragraf (p)
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";
import "./wysiwygeditor.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WYSIWYGEditor({ value = "", onChange, onEditorReady }) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value);
  const savedRange = useRef(null);
  const lastValueRef = useRef(value);
  const isInitializedRef = useRef(false);

  const [altTextModal, setAltTextModal] = useState({
    visible: false,
    imageSrc: null,
    onAttach: null,
  });
  const [tempAlt, setTempAlt] = useState("");

  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      setHtml(value || "");
      lastValueRef.current = value || "";
      if (!isInitializedRef.current && onEditorReady) {
        isInitializedRef.current = true;
        setTimeout(() => onEditorReady(), 50);
      }
    }
  }, [value, onEditorReady]);

  useEffect(() => {
    if (onChange && html !== lastValueRef.current) {
      lastValueRef.current = html;
      onChange(html);
    }
  }, [html, onChange]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      } catch (err) {
        console.warn("Gagal restore selection:", err);
      }
    }
  };

  const insertEditableParagraphAfter = (node) => {
    if (!editorRef.current) return;
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (node && node.parentNode) {
      if (node.nextSibling) node.parentNode.insertBefore(p, node.nextSibling);
      else node.parentNode.appendChild(p);
    } else {
      editorRef.current.appendChild(p);
    }
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    savedRange.current = range;
    return p;
  };

  const setCaretToEnd = (el) => {
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    savedRange.current = range;
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      saveSelection();
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      if (onChange && newHtml !== lastValueRef.current) {
        lastValueRef.current = newHtml;
        onChange(newHtml);
      }
    }
  };

  const exec = (command, value = null, forceEnd = false) => {
    saveSelection();
    document.execCommand(command, false, value);
    handleEditorChange();
    if (forceEnd) setCaretToEnd(editorRef.current);
    else restoreSelection();
  };

  const getCurrentBlock = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;
    let node = selection.anchorNode;
    if (!node) return null;
    if (node.nodeType === 3) node = node.parentNode;
    while (node && node !== editorRef.current) {
      const tag = node.nodeName.toLowerCase();
      if (["h1", "h2", "h3", "h4", "h5", "p"].includes(tag)) return node;
      node = node.parentNode;
    }
    return null;
  };

  const toggleHeading = (tag) => {
    saveSelection();
    const block = getCurrentBlock();
    if (block && block.nodeName.toLowerCase() === tag) {
      const p = document.createElement("p");
      p.innerHTML = block.innerHTML;
      block.parentNode.replaceChild(p, block);
      handleEditorChange();
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      savedRange.current = range;
    } else exec("formatBlock", `<${tag}>`);
  };

  // ============================================================
  // ✅ ALT TEXT MODAL HANDLER
  // ============================================================
  const openAltTextModal = (imageSrc, onAttachCallback) => {
    setTempAlt("");
    setAltTextModal({
      visible: true,
      imageSrc,
      onAttach: onAttachCallback,
    });
  };

  const handleAttachAltText = () => {
    if (altTextModal.onAttach) {
      altTextModal.onAttach(tempAlt);
    }
    setAltTextModal({ visible: false, imageSrc: null, onAttach: null });
    setTempAlt("");
  };

  // ============================================================
  // ✅ IMAGE HANDLERS
  // ============================================================
  const insertImageToEditor = (src, alt = "") => {
    if (!editorRef.current) return;
    let range = savedRange.current;
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.setAttribute("contentEditable", "false");

    try {
      if (!range || !range.commonAncestorContainer) {
        editorRef.current.appendChild(img);
      } else {
        restoreSelection();
        range = savedRange.current;
        range.collapse(false);
        range.insertNode(img);
      }
    } catch (err) {
      console.warn("Fallback insert image:", err);
      editorRef.current.appendChild(img);
    }

    insertEditableParagraphAfter(img);
    handleEditorChange();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      openAltTextModal(reader.result, (alt) => insertImageToEditor(reader.result, alt));
    };
    reader.readAsDataURL(file);
  };

  const handleImageByUrl = () => {
    saveSelection();
    const url = prompt("Masukkan URL gambar:");
    if (!url) return;
    openAltTextModal(url, (alt) => insertImageToEditor(url, alt));
  };

  // ============================================================
  // ✅ VIDEO HANDLERS
  // ============================================================
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const fileName = `blog/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file, { contentType: file.type, upsert: true });
    if (uploadError) {
      console.error("Upload video gagal:", uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;
    if (editorRef.current) {
      saveSelection();
      const wrapper = document.createElement("div");
      wrapper.className = "video-wrapper";
      wrapper.style.display = "block";
      wrapper.style.margin = "1em 0";
      wrapper.setAttribute("contentEditable", "true");
      wrapper.setAttribute("data-embedded-video", "true");
      const videoEl = document.createElement("video");
      videoEl.src = publicUrl;
      videoEl.controls = true;
      videoEl.style.maxWidth = "100%";
      videoEl.setAttribute("contentEditable", "false");
      wrapper.appendChild(videoEl);
      const range = savedRange.current;
      if (range) {
        restoreSelection();
        range.collapse(false);
        range.insertNode(wrapper);
      } else editorRef.current.appendChild(wrapper);
      insertEditableParagraphAfter(wrapper);
      handleEditorChange();
    }
  };

  const handleVideoByUrl = () => {
    saveSelection();
    const url = prompt("Masukkan URL video (YouTube, Vimeo, atau MP4):");
    if (!url || !editorRef.current) return;
    const wrapper = document.createElement("div");
    wrapper.className = "video-wrapper";
    wrapper.style.display = "block";
    wrapper.style.margin = "1em 0";
    wrapper.setAttribute("contentEditable", "true");
    wrapper.setAttribute("data-embedded-video", "true");
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          const parsedUrl = new URL(url);
          if (parsedUrl.searchParams.get("v")) videoId = parsedUrl.searchParams.get("v");
          else videoId = parsedUrl.pathname.split("/").pop();
        } catch {
          const parts = url.split("v=");
          videoId = parts.length > 1 ? parts.pop().split("&")[0] : url.split("/").pop();
        }
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
        iframe.title = "YouTube video";
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16/9";
        iframe.style.border = "0";
        iframe.setAttribute("contentEditable", "false");
        wrapper.appendChild(iframe);
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        const iframe = document.createElement("iframe");
        iframe.src = `https://player.vimeo.com/video/${videoId}`;
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16/9";
        iframe.style.border = "0";
        iframe.setAttribute("contentEditable", "false");
        wrapper.appendChild(iframe);
      } else {
        const videoEl = document.createElement("video");
        videoEl.controls = true;
        videoEl.src = url;
        videoEl.style.maxWidth = "100%";
        videoEl.setAttribute("contentEditable", "false");
        wrapper.appendChild(videoEl);
      }
    } catch (err) {
      console.error("Gagal membuat embed video dari URL:", err);
      return;
    }
    const range = savedRange.current;
    if (range) {
      restoreSelection();
      range.collapse(false);
      range.insertNode(wrapper);
    } else editorRef.current.appendChild(wrapper);
    insertEditableParagraphAfter(wrapper);
    handleEditorChange();
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <>
      <div className="editor-container">
        <div className="toolbar">
          {/* Formatting */}
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}><Bold size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}><Italic size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}><Underline size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("strikeThrough")}><Strikethrough size={18} /></button>

          {/* Headings */}
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("p")}><Pilcrow size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h1")}><Heading1 size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h2")}><Heading2 size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h3")}><Heading3 size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h4")}>H4</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h5")}>H5</button>

          {/* Lists and alignments */}
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}><List size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}><ListOrdered size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyLeft")}><AlignLeft size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyCenter")}><AlignCenter size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyRight")}><AlignRight size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyFull")}><AlignJustify size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("outdent")}><Outdent size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("indent")}><Indent size={18} /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}><Eraser size={18} /></button>

          {/* Image and video */}
          <label className="upload-btn" onMouseDown={(e) => e.preventDefault()}>
            <ImageIcon size={18} />
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>

          <button onMouseDown={(e) => e.preventDefault()} onClick={handleImageByUrl}><LinkIcon size={18} /></button>

          <label className="upload-btn" onMouseDown={(e) => e.preventDefault()}>
            <Video size={18} />
            <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
          </label>

          <button onMouseDown={(e) => e.preventDefault()} onClick={handleVideoByUrl}><LinkIcon size={18} /></button>
        </div>

        <div
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleEditorChange}
          onKeyUp={() => { saveSelection(); handleEditorChange(); }}
          onMouseUp={() => { saveSelection(); handleEditorChange(); }}
          onPaste={handleEditorChange}
          onCut={handleEditorChange}
        />
      </div>

      {/* ALT TEXT MODAL */}
      {altTextModal.visible && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              width: "320px",
              textAlign: "center",
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>Tambahkan Alt Text</h4>
            <input
              type="text"
              value={tempAlt}
              onChange={(e) => setTempAlt(e.target.value)}
              placeholder="Deskripsi gambar..."
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={handleAttachAltText}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

