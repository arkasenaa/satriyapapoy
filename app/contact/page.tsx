
import Script from "next/script";
import "./style.css";
import "./responsive.css";

export const metadata = {
  title: "Satriya Papoy - Contact",
  description: "Halaman Contact Satriya Papoy",
};

export default function ContactPage() {
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
        <div className="content-container">
          <div className="main-content">
            <div className="main-content-top">
              <div className="main-content-top-left">
                <h2>Lets Make an Impact Together</h2>
              </div>
              <div className="main-content-top-right">
                <p>
                  Whether you have questions, inquiries, or just want to say
                  hello, I'd love to hear from you. Reach out using the details
                  below, and get back to you soon.
                </p>
              </div>
            </div>

            <div className="main-content-bottom">
              <div className="main-content-bottom-left">
                <div className="contact-info">
                  <button className="email">satriyapapoy@gmail.com</button>
                  <button className="download-cv">Download CV</button>
                </div>
              </div>

              <div className="main-content-bottom-right">
                <div className="social-icons">
                  <a href="https://instagram.com/satriyapapoy">
                    <img
                      src="/contact/instagram-icon.PNG"
                      alt="Instagram"
                    />
                  </a>
                  <a href="#">
                    <img src="/contact/LinkedIn-icon.PNG" alt="LinkedIn" />
                  </a>
                </div>
              </div>
            </div>
          </div>
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
