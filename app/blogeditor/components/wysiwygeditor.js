"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Indent, Outdent,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video, Eraser, Link as LinkIcon
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

import "./wysiwygeditor.css";

export default function WYSIWYGEditor({ value = "", onChange }) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value);
  const savedRange = useRef(null);
  const lastValueRef = useRef(value);

  // sinkronisasi dari luar -> editor
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      setHtml(value || "");
      lastValueRef.current = value || "";
    }
  }, [value]);

  // panggil ke parent jika html berubah
  useEffect(() => {
    if (onChange && html !== lastValueRef.current) {
      lastValueRef.current = html;
      onChange(html);
    }
  }, [html, onChange]);

  // simpan selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // restore selection
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  // caret ke akhir
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

  // buat paragraf editable kosong setelah node dan letakkan caret di situ
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

  const exec = (command, value = null, forceEnd = false) => {
    saveSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
      if (forceEnd) {
        setCaretToEnd(editorRef.current);
      } else {
        restoreSelection();
      }
    }
  };

  // cek block
  const getCurrentBlock = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;
    let node = selection.anchorNode;
    if (!node) return null;
    if (node.nodeType === 3) node = node.parentNode;
    while (node && node !== editorRef.current) {
      const tag = node.nodeName.toLowerCase();
      if (["h1", "h2", "h3", "p"].includes(tag)) {
        return node;
      }
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
      setHtml(editorRef.current.innerHTML);

      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      savedRange.current = range;
    } else {
      exec("formatBlock", `<${tag}>`);
    }
  };

  // upload image lokal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // reset input value so same file can be reselected later
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (editorRef.current) {
        const img = document.createElement("img");
        img.src = reader.result;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.setAttribute("contentEditable", "false");

        // restore selection then insert
        restoreSelection();
        const range = savedRange.current || document.createRange();
        range.collapse(false);
        range.insertNode(img);

        // place a paragraph after img and move caret there
        insertEditableParagraphAfter(img);

        setHtml(editorRef.current.innerHTML);
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ upload video ke Supabase + insert ke editor (revisi: tanpa tombol hapus, caret tersedia)
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    // reset input value so same file can be reselected later
    e.target.value = "";
    if (!file) return;

    const fileName = `blog/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

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
      // biarkan wrapper editable sehingga caret/backspace bisa bekerja normal
      wrapper.setAttribute("contentEditable", "true");
      wrapper.setAttribute("data-embedded-video", "true");

      const videoEl = document.createElement("video");
      videoEl.src = publicUrl;
      videoEl.controls = true;
      videoEl.style.maxWidth = "100%";
      // video element itself non-editable
      videoEl.setAttribute("contentEditable", "false");

      wrapper.appendChild(videoEl);

      const range = savedRange.current;
      if (range) {
        restoreSelection();
        range.collapse(false);
        range.insertNode(wrapper);
      } else {
        editorRef.current.appendChild(wrapper);
      }

      // buat paragraf editable setelah video dan letakkan caret di situ
      insertEditableParagraphAfter(wrapper);

      setHtml(editorRef.current.innerHTML);
    }
  };

  // insert image by URL
  const handleImageByUrl = () => {
    saveSelection();
    const url = prompt("Masukkan URL gambar:");
    if (url && editorRef.current) {
      exec("insertImage", url, true);
    }
  };

  // insert video by URL (YouTube, Vimeo, MP4) — revisi: buat node programmatically
  const handleVideoByUrl = () => {
    // penting: simpan selection sebelum prompt supaya tidak hilang
    saveSelection();
    const url = prompt("Masukkan URL video (YouTube, Vimeo, atau MP4):");
    if (!url || !editorRef.current) return;

    const wrapper = document.createElement("div");
    wrapper.className = "video-wrapper";
    wrapper.style.display = "block";
    wrapper.style.margin = "1em 0";
    wrapper.setAttribute("contentEditable", "true");
    wrapper.setAttribute("data-embedded-video", "true");

    // buat node sesuai tipe
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          const parsedUrl = new URL(url);
          if (parsedUrl.searchParams.get("v")) {
            videoId = parsedUrl.searchParams.get("v");
          } else {
            videoId = parsedUrl.pathname.split("/").pop();
          }
        } catch {
          // fallback parsing
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
        // anggap mp4 atau direct video link
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

    // masukkan ke editor pada posisi selection (jika ada) atau append
    const range = savedRange.current;
    if (range) {
      restoreSelection();
      range.collapse(false);
      range.insertNode(wrapper);
    } else {
      editorRef.current.appendChild(wrapper);
    }

    // buat paragraf editable setelah video dan letakkan caret di situ
    insertEditableParagraphAfter(wrapper);
    setHtml(editorRef.current.innerHTML);
  };

  // agar toolbar tidak membuat editor kehilangan fokus/selection saat diklik,
  // kita gunakan onMouseDown={e => e.preventDefault()} pada tombol toolbar (diterapkan di JSX)
  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}><Bold size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}><Italic size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}><Underline size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("strikeThrough")}><Strikethrough size={18} /></button>

        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h1")}><Heading1 size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h2")}><Heading2 size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleHeading("h3")}><Heading3 size={18} /></button>

        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}><List size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}><ListOrdered size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyLeft")}><AlignLeft size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyCenter")}><AlignCenter size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyRight")}><AlignRight size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyFull")}><AlignJustify size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("outdent")}><Outdent size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("indent")}><Indent size={18} /></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}><Eraser size={18} /></button>

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
        onInput={() => {
          if (editorRef.current) {
            saveSelection();
            setHtml(editorRef.current.innerHTML);
          }
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
}
