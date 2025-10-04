"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import "./styling.css";
import "./responsive2.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BlogPost() {
  const params = useParams();
  const { id } = params;

  const [post, setPost] = useState(null);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        let fixedContent = data.content || "";

        // ✅ Pastikan semua <video> punya controls
        fixedContent = fixedContent.replace(
          /<video(?![^>]*controls)([^>]*)>/gi,
          `<video controls$1>`
        );

        // ✅ Tangani video tag
        fixedContent = fixedContent.replace(
          /<video([^>]*)src="([^"]+)"([^>]*)><\/video>/gi,
          (match, before, src, after) => {
            let finalUrl = src;

            // kalau src belum full URL, buatkan public URL dari supabase
            if (!src.startsWith("http")) {
              const { data: urlData } = supabase.storage
                .from("videos")
                .getPublicUrl(src.startsWith("blog/") ? src : `blog/${src}`);
              if (urlData?.publicUrl) {
                finalUrl = urlData.publicUrl;
              }
            }

            return `<div class="video-wrapper"><video${before}${after} controls><source src="${finalUrl}" type="video/mp4"></video></div>`;
          }
        );

        // ✅ Bungkus iframe (YouTube/Vimeo)
        fixedContent = fixedContent.replace(
          /<iframe([^>]*)><\/iframe>/gi,
          `<div class="video-wrapper"><iframe$1></iframe></div>`
        );

        setPost({ ...data, content: fixedContent });
      }
    };

    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("id", id)
        .limit(10);

      if (error) {
        console.error("Error fetching latest posts:", error.message);
      } else {
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 4);
        setLatest(shuffled);
      }
    };

    fetchPost();
    fetchLatest();
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <>
      {/* Header */}
      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <Link href="/"><img src="/satriyapapoy.png" alt="logo" /></Link>
            </div>
            <div className="navbar-links">
              <Link href="/blog">blog</Link>
              <Link href="/about">about</Link>
              <Link href="/contact">contact</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="content">
          <div className="header-content">
            <h1>{post.title}</h1>
            <div className="identity">
              <div className="identity-left">
                <img src="/papoy.jpg" alt="author" />
              </div>
              <div className="identity-right">
                <small>{post.author || "Satriya Papoy"}</small>
                <small> | </small>
                <small>
                  {new Date(post.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </small>
              </div>
            </div>
            <hr className="solid" />
          </div>

          {/* Isi Artikel */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Gambar Utama */}
          {post.main_image && (
            <div className="main-image">
              <img src={post.main_image} alt={post.title} />
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="content-tags">
              {post.tags.split(",").map((tag, i) => (
                <span key={i} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Articles */}
      <div className="blog-post-container">
        <div className="blog-post-content-header">
          <h2>See also: Latest article</h2>
        </div>
        <div className="blog-post-content-cards">
          {latest.map((item) => (
            <div
              key={item.id}
              className="Frame-33"
              onClick={() => (window.location.href = `/blog-post/${item.id}`)}
            >
              <img
                src={item.cover_url || "/grey.jpg"}
                alt={item.title}
                className="blog-image"
              />
              <div className="description">
                <span className="tag">{item.category || "Uncategorized"}</span>
                <span className="date">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <h4>{item.title}</h4>
                <div
                  className="excerpt"
                  dangerouslySetInnerHTML={{
                    __html: item.content
                      ? item.content.replace(/<[^>]+>/g, "").split(" ").slice(0, 20).join(" ") + "..."
                      : "",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-content">
            <div className="owner-identity">
              <h2>Satriya Papoy —</h2>
              <p>satriyapapoy@gmail.com</p>
            </div>
            <div className="footer-links">
              <a href="#blog">blog</a>
              <a href="#about">about</a>
              <a href="#contact">contact</a>
            </div>
            <div className="lets-connect">
              <h2>Let's connect!</h2>
              <p>LinkedIn<br />Instagram<br />Behance</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
