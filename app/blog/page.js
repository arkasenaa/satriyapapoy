"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";
import Script from "next/script";
import "./blog.css";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data.length > 0) {
        setPosts(data);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  // === Dummy posts fallback (pakai sama persis seperti HTML vanilla Anda) ===
  const dummyPosts = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    image_url: "/blog/grey.jpg",
    tag: "Digital Transformation",
    created_at: "2023-04-20",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. suspendisse pellentesque felis augue, a volutpat justo imperdiet non",
  }));

  return (
    <>
      <Head>
        <title>Satriya Papoy</title>
        <style>{`
          header { font-family: 'myFont'; }
          body { font-family: 'myFont'; }
        `}</style>
      </Head>

      <Script
        src="https://kit.fontawesome.com/222af2bd60.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <img src="blog/satriyapapoy.png" />
            </div>
            <div className="navbar-links">
              <a href="/blog">blog</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
            </div>
          </div>
        </nav>
      </header>

      <div className="header-container">
        <h2>Blogs</h2>
      </div>

      <main>
        <div className="main-container">
          <div className="main-content">
            <div className="main-content-left">
              {/* Kalau Supabase kosong → tampilkan dummy */}
              {(posts.length > 0 ? posts : dummyPosts).map((post) => {
                const isDummy = posts.length === 0; // ✅ kalau Supabase kosong, berarti dummy

                return (
                <div
                  key={post.id}
                  className={isDummy ? "Frame-33" : "blog-card"}
                  onClick={() =>
                  isDummy
                  ? (window.location.href = `/blog-post`)          // dummy → ke blog-post/page.tsx
                  : (window.location.href = `/blog-post/${post.id}`) // supabase → ke blog-post/[id]/page.js
                }
                >
                <img
                  src={post.cover_url || post.image_url || "/blog/grey.jpg"}
                  alt=""
                  className="blog-image"
                />
                <div className="article-content">
                  <div className="tag-date-content">
                  <span className="tag">{post.tag || "Uncategorized"}</span>
                  <span className="date">{formatDate(post.created_at)}</span>
                </div>
                <h2>{post.title}</h2>
                  <div
                    className="excerpt"
                    dangerouslySetInnerHTML={{
                    __html: post.content
                    ? post.content.substring(0, 200) + "..."
                    : ""
                    }}
                  />
                </div>
              </div>
                );
              })}
            </div>

            <div className="main-content-right">
              <div className="category-menu">
                <a href="#" className="active">Category</a>
                <a href="#">Business Strategy</a>
                <a href="#">Market Research and Analysis</a>
                <a href="#">Financial Analysis and Modeling</a>
                <a href="#">Digital Transformation</a>
                <a href="#">Business Process</a>
                <a href="#">Leadership & Organizational Development</a>
                <a href="#">Data Analytics & BI</a>
                <a href="#">Reviews</a>
                <a href="#">Personal Insights</a>
              </div>

              <div className="Frame-53">
                <h2>Popular Post</h2>
                <div className="Frame-52">
                  <div className="Frame-48" data-url="blog-post.html">
                    <span className="tag">Digital Transformation</span>
                    <span className="date">20 April 2023</span>
                    <h2>
                      Lorem ipsum dolor sit amet,<br />
                      consectetur adipiscing elit
                    </h2>
                  </div>
                  <div className="Frame-48" data-url="blog-post.html">
                    <span className="tag">Digital Transformation</span>
                    <span className="date">20 April 2023</span>
                    <h2>
                      Lorem ipsum dolor sit amet,<br />
                      consectetur adipiscing elit
                    </h2>
                  </div>
                  <div className="Frame-48" data-url="blog-post.html">
                    <span className="tag">Digital Transformation</span>
                    <span className="date">20 April 2023</span>
                    <h2>
                      Lorem ipsum dolor sit amet,<br />
                      consectetur adipiscing elit
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-container">
          <div className="footer-content">
            <div className="owner-identity">
              <h2>Satriya Papoy —</h2>
              <p>satriyapapoy@gmail.com</p>
            </div>
            <div className="footer-links">
              <a href="/blog">blog</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
            </div>
            <div className="lets-connect">
              <h2>Let's connect!</h2>
              <p>
                LinkedIn
                <br />
                Instagram
                <br />
                Behance
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
