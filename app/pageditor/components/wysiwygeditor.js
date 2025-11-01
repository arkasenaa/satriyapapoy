"use client"
import React, { useRef, useState, useEffect } from "react";
import {
    Bold, Italic, Underline, List, Strikethrough, ListOrdered,
    Image as ImageIcon, Eraser, Link as LinkIcon,
    Pilcrow
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";
import "./wysiwygeditor.css";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WYSIWYGeditor({ value = "", onChange, onEditorReady}) {
    const editorRef = useRef (null);
    const [html, setHtml] = useState (value);
    const savedRange = useRef(null);
    const lastValueRef = useRef(value);
    const isInitializedRef = useRef (false);

    const [altTextModal, setAltTextModal] = useState({
        visible: false,
        imageSrc: null,
        onAttach: null,
    })
    const [tempAlt, setTempAlt] = useState ("");

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
        const p = document.createElement ("p");
        p.innerHTML = "<br>";
        if (node && node.parentNode) {
            if (node.nextSibiling) node.parentNode.insertBefore(p, node.nextSibiling);
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
        if (forceEnd) setCaretEnd(editorRef.current);
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
            if (["p"].includes(tag)) return node;
            node = node.parentNode;
        }
        return null;
    };

    const ToggleHeading = (tag) => {
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

    const openAltTextModal = (imageSrc, onAttachCallBack) => {
        setTempAlt("");
        setAltTextModal({
            visible: true,
            imageSrc,
            onAttach: onAttachCallBack,
        });
    };

    const handleAttachAltText = () => {
        if (altTextModal.onAttach) {
            altTextModal.onAttach(tempAlt);
        }
        setAltTextModal({ visible: false, imageSrc: null, onAttach: null });
        setTempAlt("");
    };

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
        } catch (err){
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
        const url = prompt("Enter image URL:");
        if (!url) return;
        openAltTextModal(url, (alt) => insertImageToEditor(url, alt));
    };

    return (
        <>
            <div className="editor-container">
                <div className="toolbar">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}><Bold size={18} /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}><Italic size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}><Underline size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("strikeThrough")}><Strikethrough size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("p")}><Pilcrow size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}><List size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}><ListOrdered size={18}/></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}><Eraser size={18}/></button>
                    <label className="upload-btn" onMouseDown={(e) => e.preventDefault()}>
                        <ImageIcon size={18}/>
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload}/>
                    </label>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={handleImageByUrl}><LinkIcon size={18}/></button>
                </div>
                <div
                ref={editorRef}
                className="editor"
                contentEditable
                suppressContentEditableWarning={true}
                onInput={handleEditorChange}
                onKeyUp={() => { saveSelection(); handleEditorChange(); }}
                onMouseUp={() => {saveSelection(); handleEditorChange(); }}
                onPaste={handleEditorChange}
                onCut={handleEditorChange}
                />
            </div>
            {altTextModal.visible && (
                <div
                  style={{
                    position:"fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    JustifyContent: "center",
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
                            borderRadius: "8px 16px",
                            cursor: "pointer",
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