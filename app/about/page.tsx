
import Script from "next/script";
import "./style.css";
import "./responsive.css";

export const metadata = {
  title: "Satriya Papoy - About",
  description: "Halaman About Satriya Papoy",
};

export default function AboutPage() {
  return (
    <>
      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <a href="/">
                <img src="/about/satriyapapoy.png" alt="logo" />
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

      <div className="container">
        <div className="content">
          <div className="header-content">
            <div className="header-content-left">
              <img src="/about/ownerabout.jpeg" alt="Owner" />
            </div>
            <div className="header-content-right">
              <h1>I turn business insight into impactful strategies</h1>
            </div>
          </div>

          <div className="main-content">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget, imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum neque vulputate.
            </p>
            <h2>Lorem Ipsum?</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget, imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum neque vulputate.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex consequat maximus eu sit amet massa. Nullam et purus ut massa consequat suscipit. Donec sollicitudin tristique nulla, nec hendrerit ante porta non. Pellentesque ipsum orci, aliquet in interdum eget, rhoncus sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget, imperdiet molestie quam. Curabitur dapibus diam id nisi sollicitudin, vitae rutrum neque vulputate.</p>
          </div>
        </div>
      </div>

      <div className="body-footer-container">
        <div className="body-footer-content">
          <div className="body-footer-content-top">
            <div className="body-footer-content-top-left">
              <h2>Lets Make an impact together</h2>
            </div>
            <div className="body-footer-content-top-right">
              <p>
                Whether you have questions, inquiries, or just want to say hello...
              </p>
            </div>
          </div>

          <div className="body-footer-content-bottom">
            <div className="body-footer-content-bottom-left">
              <div className="contact-info">
                <button className="email">satriyapapoy@gmail.com</button>
                <button className="download-cv">Download CV</button>
              </div>
            </div>

            <div className="body-footer-content-bottom-right">
              <div className="social-icons">
                <a href="https://instagram.com/satriyapapoy">
                  <img src="/contact/instagram-icon.PNG" alt="Instagram" />
                </a>
                <a href="#">
                  <img src="/contact/LinkedIn-icon.PNG" alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Script khusus */}
      <Script
        src="https://kit.fontawesome.com/222af2bd60.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
