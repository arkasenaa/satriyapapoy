import React from "react";
import Script from "next/script";
import "./styles.css";
import "./responsive.css";

export default function ProjectPage() {
  return (
    <html lang="en">
      <head>
        <title>Satriya Papoy</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        {/* Font Awesome */}
        <Script
          src="https://kit.fontawesome.com/222af2bd60.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {/* Header */}
        <header>
          <nav className="header_responsive">
            <div className="header-contents">
              <div className="navbar-brand">
                <a href="/">
                  <img src="/project/satriyapapoy.png" alt="Logo" />
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

        {/* Header container */}
        <div className="header-container">
          <h1>Relax Goods Co</h1>
          <p>2018 / Fashion Industry</p>
        </div>

        {/* Main */}
        <main>
          <div className="main-container">
            <div className="main-content">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex
                consequat maximus eu sit amet massa. Nullam et purus ut massa
                consequat suscipit.
              </p>

              <div className="main-content-image">
                <img src="/project/grey2.jpg" alt="grey2" />
              </div>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex
                consequat maximus eu sit amet massa. Nullam et purus ut massa
                consequat suscipit. Donec sollicitudin tristique nulla, nec
                hendrerit ante porta non.
              </p>
              <p>
                Pellentesque ipsum orci, aliquet in interdum eget, rhoncus
                sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget,
                imperdiet molestie quam. Curabitur dapibus diam id nisi
                sollicitudin, vitae rutrum neque vulputate.
              </p>

              <div className="footer-cards">
                <img src="/project/grey.jpg" alt="grey1" />
                <img src="/project/grey.jpg" alt="grey2" />
                <img src="/project/grey.jpg" alt="grey3" />
                <img src="/project/grey.jpg" alt="grey4" />
              </div>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec ex
                consequat maximus eu sit amet massa. Nullam et purus ut massa
                consequat suscipit. Donec sollicitudin tristique nulla, nec
                hendrerit ante porta non.
              </p>
              <p>
                Pellentesque ipsum orci, aliquet in interdum eget, rhoncus
                sollicitudin odio. Aliquam ex sem, facilisis nec ligula eget,
                imperdiet molestie quam. Curabitur dapibus diam id nisi
                sollicitudin, vitae rutrum neque vulputate.
              </p>
            </div>
          </div>
        </main>

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
      </body>
    </html>
  );
}
