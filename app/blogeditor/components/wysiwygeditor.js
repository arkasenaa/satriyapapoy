"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Indent, Outdent,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video, Eraser, Link as LinkIcon
} from "lucide-react";

import "./wysiwygeditor.css";

export default function WYSIWYGEditor({ value = "", onChange }) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value);
  const savedRange = useRef(null);

  // ⏩ isi awal hanya saat value dari luar berubah (misal load draft)
  useEffect(() => {
    if (editorRef.current && value !== html) {
      editorRef.current.innerHTML = value || "";
      setHtml(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ⏩ kirim ke parent hanya saat html internal berubah
  useEffect(() => {
    if (onChange && html !== value) {
      onChange(html);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

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

  // cek elemen blok saat ini
  const getCurrentBlock = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    let node = selection.anchorNode;
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

  // toggle heading tanpa harus blok manual
  const toggleHeading = (tag) => {
    saveSelection();
    const block = getCurrentBlock();

    if (block && block.nodeName.toLowerCase() === tag) {
      // ganti ke <p>
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (editorRef.current) {
        const img = document.createElement("img");
        img.src = reader.result;
        img.style.maxWidth = "100%";
        img.style.height = "auto";

        if (savedRange.current) {
          restoreSelection();
          const range = savedRange.current;
          range.collapse(false);
          range.insertNode(img);
          range.setStartAfter(img);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          savedRange.current = range;
        } else {
          editorRef.current.appendChild(img);
        }

        setHtml(editorRef.current.innerHTML);
      }
    };
    reader.readAsDataURL(file);
  };

  // upload video lokal
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (editorRef.current) {
      saveSelection();
      editorRef.current.innerHTML += `<video controls src="${url}" style="max-width:100%;"></video>`;
      setHtml(editorRef.current.innerHTML);
      setCaretToEnd(editorRef.current);
    }
  };

  // insert image by URL
  const handleImageByUrl = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url && editorRef.current) {
      exec("insertImage", url, true);
    }
  };

  // insert video by URL
  const handleVideoByUrl = () => {
    const url = prompt("Masukkan URL video (YouTube, Vimeo, atau MP4):");
    if (url && editorRef.current) {
      let embedCode = "";

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
          videoId = url.split("v=").pop();
        }
        embedCode = `
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/${videoId}?rel=0"
              title="YouTube video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="width:100%; aspect-ratio:16/9; border:0;"
            ></iframe>
          </div>`;
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        embedCode = `
          <div class="video-wrapper">
            <iframe
              src="https://player.vimeo.com/video/${videoId}"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
              style="width:100%; aspect-ratio:16/9; border:0;"
            ></iframe>
          </div>`;
      } else {
        embedCode = `<video controls src="${url}" style="max-width:100%;"></video>`;
      }

      saveSelection();
      editorRef.current.innerHTML += embedCode;
      setHtml(editorRef.current.innerHTML);
      setCaretToEnd(editorRef.current);
    }
  };

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={() => exec("bold")}><Bold size={18} /></button>
        <button onClick={() => exec("italic")}><Italic size={18} /></button>
        <button onClick={() => exec("underline")}><Underline size={18} /></button>
        <button onClick={() => exec("strikeThrough")}><Strikethrough size={18} /></button>

        <button onClick={() => toggleHeading("h1")}><Heading1 size={18} /></button>
        <button onClick={() => toggleHeading("h2")}><Heading2 size={18} /></button>
        <button onClick={() => toggleHeading("h3")}><Heading3 size={18} /></button>

        <button onClick={() => exec("insertUnorderedList")}><List size={18} /></button>
        <button onClick={() => exec("insertOrderedList")}><ListOrdered size={18} /></button>
        <button onClick={() => exec("justifyLeft")}><AlignLeft size={18} /></button>
        <button onClick={() => exec("justifyCenter")}><AlignCenter size={18} /></button>
        <button onClick={() => exec("justifyRight")}><AlignRight size={18} /></button>
        <button onClick={() => exec("justifyFull")}><AlignJustify size={18} /></button>
        <button onClick={() => exec("outdent")}><Outdent size={18} /></button>
        <button onClick={() => exec("indent")}><Indent size={18} /></button>
        <button onClick={() => exec("removeFormat")}><Eraser size={18} /></button>

        <label className="upload-btn">
          <ImageIcon size={18} />
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </label>

        <button onClick={handleImageByUrl}><LinkIcon size={18} /></button>

        <label className="upload-btn">
          <Video size={18} />
          <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
        </label>

        <button onClick={handleVideoByUrl}><LinkIcon size={18} /></button>
      </div>

      <div
        ref={editorRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning={true}
        onInput={() => {
          if (editorRef.current) {
            saveSelection();
            // hanya update state tanpa overwrite DOM
            setHtml(editorRef.current.innerHTML);
          }
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
}
