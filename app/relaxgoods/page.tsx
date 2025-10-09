// app/relaxgoods/page.tsx
import "./style.css";
import "./responsive.css";
import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "Satriya Papoy",
  description: "Relax Goods Co - 2018 / Fashion Industry",
};

export default function RelaxGoodsPage() {
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
            <h1>Relax Goods Co</h1>
            <p>2018 / Fashion Industry</p>
          </div>
        </div>

        <main>
          <div className="main-container">
            <div className="main-content">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec
                ex consequat maximus eu sit amet massa. Nullam et purus ut massa
                consequat suscipit.
              </p>

              <div className="main-content-image">
                <img src="/grey2.jpg" alt="grey2" />
              </div>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec
                ex consequat maximus eu sit amet massa. Nullam et purus ut massa
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
                <img src="/grey.jpg" alt="grey" />
                <img src="/grey.jpg" alt="grey" />
                <img src="/grey.jpg" alt="grey" />
                <img src="/grey.jpg" alt="grey" />
              </div>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                sit amet dapibus nibh. Sed quis odio diam. Fusce sed metus nec
                ex consequat maximus eu sit amet massa. Nullam et purus ut massa
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
