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

  export default function WYSIWYGEditor({ value = "", onChange, onEditorReady }) {
    const editorRef = useRef(null);
    const [html, setHtml] = useState(value);
    const savedRange = useRef(null);
    const lastValueRef = useRef(value);
    const isInitializedRef = useRef(false);

    // ✅ FIXED: Sinkronisasi dari luar -> editor - lebih robust
    useEffect(() => {
      if (editorRef.current && value !== lastValueRef.current) {
        console.log("WYSIWYG: Receiving new value from parent", value ? value.length : 0);
        editorRef.current.innerHTML = value || "";
        setHtml(value || "");
        lastValueRef.current = value || "";
        
        // ✅ NEW: Notify parent that editor is ready after first value sync
        if (!isInitializedRef.current && onEditorReady) {
          isInitializedRef.current = true;
          setTimeout(() => {
            onEditorReady();
          }, 50);
        }
      }
    }, [value, onEditorReady]);

    // ✅ FIXED: Panggil ke parent jika html berubah - lebih responsif
    useEffect(() => {
      if (onChange && html !== lastValueRef.current) {
        console.log("WYSIWYG: Sending changes to parent", html ? html.length : 0);
        lastValueRef.current = html;
        onChange(html);
      }
    }, [html, onChange]);

    // ✅ FIXED: Handler untuk setiap perubahan di editor - langsung kirim ke parent
    const handleEditorChange = () => {
      if (editorRef.current) {
        saveSelection();
        const newHtml = editorRef.current.innerHTML;
        setHtml(newHtml);
        
        // ✅ KIRIM LANGSUNG ke parent tanpa menunggu useEffect
        if (onChange && newHtml !== lastValueRef.current) {
          console.log("WYSIWYG: Immediate change to parent", newHtml ? newHtml.length : 0);
          lastValueRef.current = newHtml;
          onChange(newHtml);
        }
      }
    };

    // ✅ NEW: Initialize editor on mount
    useEffect(() => {
      if (editorRef.current && !isInitializedRef.current) {
        isInitializedRef.current = true;
        editorRef.current.innerHTML = value || "";
        
        // Notify parent that editor is ready
        if (onEditorReady) {
          setTimeout(() => {
            onEditorReady();
          }, 100);
        }
      }
    }, [value, onEditorReady]);

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
      
      // ✅ FIXED: Langsung panggil handleEditorChange setelah exec command
      handleEditorChange();
      
      if (forceEnd) {
        setCaretToEnd(editorRef.current);
      } else {
        restoreSelection();
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
        
        // ✅ FIXED: Langsung update state dan kirim ke parent
        handleEditorChange();

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

          restoreSelection();
          const range = savedRange.current || document.createRange();
          range.collapse(false);
          range.insertNode(img);

          insertEditableParagraphAfter(img);

          // ✅ FIXED: Langsung update setelah insert image
          handleEditorChange();
        }
      };
      reader.readAsDataURL(file);
    };

    // upload video ke Supabase
    const handleVideoUpload = async (e) => {
      const file = e.target.files[0];
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
        } else {
          editorRef.current.appendChild(wrapper);
        }

        insertEditableParagraphAfter(wrapper);

        // ✅ FIXED: Langsung update setelah insert video
        handleEditorChange();
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

    // insert video by URL
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
            if (parsedUrl.searchParams.get("v")) {
              videoId = parsedUrl.searchParams.get("v");
            } else {
              videoId = parsedUrl.pathname.split("/").pop();
            }
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
      } else {
        editorRef.current.appendChild(wrapper);
      }

      insertEditableParagraphAfter(wrapper);
      
      // ✅ FIXED: Langsung update setelah insert video URL
      handleEditorChange();
    };

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
          onInput={handleEditorChange}
          onKeyUp={() => {
            saveSelection();
            handleEditorChange();
          }}
          onMouseUp={() => {
            saveSelection();
            handleEditorChange();
          }}
          onPaste={handleEditorChange}
          onCut={handleEditorChange}
        />
      </div>
    );
  }  
