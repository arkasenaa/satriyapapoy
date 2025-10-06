"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";
import Script from "next/script";
import "./blog.css";

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
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data?.length > 0) {
        setPosts(data);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  const allPosts = posts; // tidak pakai dummy lagi saat loading

  // Filter kategori
  const filteredPosts =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter(
          (p) => p.category && p.category === activeCategory
        );

  // Popular posts (3 terbanyak berdasarkan views)
  const popularPosts = [...(allPosts || [])]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

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
            {/* Blog list */}
            <div className="main-content-left">
              {loading ? (
                <p className="loading-text">Loading...</p>
              ) : filteredPosts.length === 0 ? (
                <p className="no-posts">No published posts available.</p>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="blog-card"
                    onClick={() =>
                      (window.location.href = `/blog-post/${post.id}`)
                    }
                  >
                    <img
                      src={post.cover_url || post.image_url || "/blog/grey.jpg"}
                      alt=""
                      className="blog-image"
                    />
                    <div className="article-content">
                      <div className="tag-date-content">
                        <span className="tag">
                          {post.category || "Uncategorized"}
                        </span>
                        <span className="date">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      <h2>{post.title}</h2>
                      <div
                        className="excerpt"
                        dangerouslySetInnerHTML={{
                          __html: post.content
                            ? post.content.substring(0, 200) + "..."
                            : "",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="main-content-right">
              {/* Category menu */}
              <div className="category-menu">
                <a className="category-title">Category</a>
                <a
                  href="#"
                  className={activeCategory === "All" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory("All");
                  }}
                >
                  All
                </a>
                {[
                  "Business Strategy",
                  "Market Research and Analysis",
                  "Financial Analysis and Modeling",
                  "Digital Transformation",
                  "Business Process",
                  "Leadership & Organizational Development",
                  "Data Analytics & BI",
                  "Reviews",
                  "Personal Insights",
                ].map((cat) => (
                  <a
                    key={cat}
                    href="#"
                    className={activeCategory === cat ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory(cat);
                    }}
                  >
                    {cat}
                  </a>
                ))}
              </div>

              {/* Popular posts */}
              <div className="Frame-53">
                <h2>Popular Post</h2>
                <div className="Frame-52">
                  {popularPosts.map((post) => (
                    <div
                      key={post.id}
                      className="Frame-48"
                      onClick={() =>
                        (window.location.href = `/blog-post/${post.id}`)
                      }
                    >
                      <span className="tag">
                        {post.category || "Uncategorized"}
                      </span>
                      <span className="date">
                        {formatDate(post.created_at)}
                      </span>
                      <h2>{post.title}</h2>
                    </div>
                  ))}
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

