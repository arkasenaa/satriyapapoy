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

  // isi awal & sync dengan prop value
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
    setHtml(value || "");
  }, [value]);

  // kirim data ke parent setiap html berubah
  useEffect(() => {
    if (onChange) onChange(html);
  }, [html, onChange]);

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
  };

  // upload image lokal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      exec("insertImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // upload video lokal
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (editorRef.current) {
      editorRef.current.innerHTML += `<video controls src="${url}" style="max-width:100%;"></video>`;
      setHtml(editorRef.current.innerHTML);
    }
  };

  // insert image by URL
  const handleImageByUrl = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url && editorRef.current) {
      exec("insertImage", url);
    }
  };

  // insert video by URL
  const handleVideoByUrl = () => {
    const url = prompt("Masukkan URL video (YouTube, Vimeo, atau MP4):");
    if (url && editorRef.current) {
      let embedCode = "";

      // YouTube
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
      }

      // Vimeo
      else if (url.includes("vimeo.com")) {
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
      }

      // Direct MP4/WEBM
      else {
        embedCode = `<video controls src="${url}" style="max-width:100%;"></video>`;
      }

      editorRef.current.innerHTML += embedCode;
      setHtml(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="editor-container">
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => exec("bold")}><Bold size={18} /></button>
        <button onClick={() => exec("italic")}><Italic size={18} /></button>
        <button onClick={() => exec("underline")}><Underline size={18} /></button>
        <button onClick={() => exec("strikeThrough")}><Strikethrough size={18} /></button>
        <button onClick={() => exec("formatBlock", "<h1>")}><Heading1 size={18} /></button>
        <button onClick={() => exec("formatBlock", "<h2>")}><Heading2 size={18} /></button>
        <button onClick={() => exec("formatBlock", "<h3>")}><Heading3 size={18} /></button>
        <button onClick={() => exec("insertUnorderedList")}><List size={18} /></button>
        <button onClick={() => exec("insertOrderedList")}><ListOrdered size={18} /></button>
        <button onClick={() => exec("justifyLeft")}><AlignLeft size={18} /></button>
        <button onClick={() => exec("justifyCenter")}><AlignCenter size={18} /></button>
        <button onClick={() => exec("justifyRight")}><AlignRight size={18} /></button>
        <button onClick={() => exec("justifyFull")}><AlignJustify size={18} /></button>
        <button onClick={() => exec("outdent")}><Outdent size={18} /></button>
        <button onClick={() => exec("indent")}><Indent size={18} /></button>
        <button onClick={() => exec("removeFormat")}><Eraser size={18} /></button>

        {/* upload image lokal */}
        <label className="upload-btn">
          <ImageIcon size={18} />
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </label>

        {/* insert image via link */}
        <button onClick={handleImageByUrl}><LinkIcon size={18} /></button>

        {/* upload video lokal */}
        <label className="upload-btn">
          <Video size={18} />
          <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
        </label>

        {/* insert video via link */}
        <button onClick={handleVideoByUrl}><LinkIcon size={18} /></button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning={true}
        onInput={() => {
          if (editorRef.current) setHtml(editorRef.current.innerHTML);
        }}
      />
    </div>
  );
}
