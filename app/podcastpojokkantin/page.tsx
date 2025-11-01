// app/relaxgoods/page.tsx
import "./style.css";
import "./responsive.css";
import Script from "next/script";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata = {
  title: "Satriya Papoy",
  description: "Relax Goods Co - 2018 / Fashion Industry",
};

export default async function PodcastPojokKantinPage() {

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("page_name", "podcastpojokkantin")
    .single();
    if (error) {
      console.error("failed to load data from podcastpojokkantin:", error)
    }
    const contentHtml = data?.content || `<p> Default content of podcastpojokkantin please update via pageditor</p>`;
  return (
    <>
      {/* Load Font Awesome (client-side script) */}
      <Script
        src="https://kit.fontawesome.com/222af2bd60.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Header */}
      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <Link href="/">
                <img src="/satriyapapoy.png" alt="Logo" />
              </Link>
            </div>
            <div className="navbar-links">
              <a href="/blog">blog</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* CONTENT WRAPPER — jangan gunakan <body> di sini */}
      <div className="page-wrapper">
        <div className="header-container">
          <div className="header-content">
            <h1>podcast pojok kantin</h1>
            <p></p>
          </div>
        </div>

        <main>
          <div className="main-container">
            <div className="main-content"
            dangerouslySetInnerHTML={{__html: contentHtml}}/>
            </div>
        </main>
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
