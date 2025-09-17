import Script from "next/script";
import "./styling.css";
import "./responsive2.css";

export const metadata = {
  title: "Satriya Papoy - Blog Post",
  description: "Halaman Blog Post Satriya Papoy",
};

export default function BlogPostPage() {
  return (
    <>
      {/* Header */}
      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <a href="/">
                <img src="/satriyapapoy.png" alt="logo" />
              </a>
            </div>
            <div className="navbar-links">
              <a href="/blog">blog</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Body */}
      <div className="container">
        <div className="content">
          <div className="header-content">
            <h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
            <div className="identity">
              <div className="identity-left">
                <img src="/papoy.jpg" alt="author" />
              </div>
              <div className="identity-right">
                <small>Satriya Papoy</small>
                <small>|</small>
                <small>20 April 2024</small>
              </div>
            </div>
            <hr className="solid" />
          </div>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus
            nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet
            massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique
            nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum
            eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget,
            imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum
            neque vulputate.
          </p>

          <div className="main-image">
            <img src="/blog/grey.jpg" alt="main" />
          </div>

          <h2>Lorem Ipsum?</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus
            nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet
            massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique
            nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum
            eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget,
            imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum
            neque vulputate.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus
            nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet
            massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique
            nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum
            eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget,
            imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum
            neque vulputate.
          </p>

          <div className="content-tags">
            <span className="tag">Tags</span>
            <span className="tag">Tags</span>
            <span className="tag">Tags</span>
            <span className="tag">Tags</span>
          </div>
        </div>
      </div>

      {/* Related Blog Posts */}
      <div className="blog-post-container">
        <div className="blog-post-content-header">
          <h2>See also: Latest article</h2>
        </div>
        <div className="blog-post-content-cards">
          {[1, 2, 3, 4].map((_, i) => (
            <div className="Frame-33" key={i}>
              <img src="/blog/grey.jpg" alt="" className="blog-image" />
              <div className="description">
                <span className="tag">Digital Transformation</span>
                <span className="date">20 April 2024</span>
                <h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                  pellentesque felis augue, a volutpat justo imperdiet non
                </p>
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

      {/* FontAwesome Script */}
      <Script
        src="https://kit.fontawesome.com/222af2bd60.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}