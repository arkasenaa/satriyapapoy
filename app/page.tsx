export default function HomePage() {
  return (
    <>
      <head>
        <title>Satriya Papoy</title>
        <script
          src="https://kit.fontawesome.com/222af2bd60.js"
          crossOrigin="anonymous"
          async
        ></script>
      </head>

      {/* Header */}
      <header>
        <nav className="header_responsive">
          <div className="header-contents">
            <div className="navbar-brand">
              <img src="/satriyapapoy.png" alt="Satriya Papoy" />
            </div>
            <div className="navbar-links">
              <a href="/blog">blog</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Welcome Section */}
      <section className="welcome_text">
        <div className="row">
          <div className="imgWrapper">
            <img src="/papoy.jpg" alt="Papoy" />
          </div>
          <div className="ContentWrapper">
            <div className="content">
              <h2>
                Hey! I'm Papoy, a creative soul passionate about graphic design,
                business, and writing.
              </h2>
              <p>
                Satriya Papoy, a graphic designer with experience in the print
                and digital media industry since 2016. When 2020, Papoy bridged
                the gap between his passion and a new field that he was starting
                to explore: business.
              </p>              
                <div className="Read-More-Header">
                <a href="#">
                  Read more <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
              </div>
              </div>
            </div>
          </div>
      </section>

      {/* Business Section */}
      <section className="Frame-12">
        <div className="Frame-19">
          <h2 className="Header">Papoy&apos;s</h2>
          <p className="Frame-12-Description">
            Let&apos;s explore the realm of my business as the CEO/Founder,
            where boundless creativity and relentless innovation come together
            in perfect harmony.
          </p>
        </div>

        <div className="container">
          <div className="card">
            <img src="/Logo Relax Goods (2).jpg" className="icon" alt="" />
            <h3 className="h3BusinessName">Relax Goods Co</h3>
            <p className="pBusinessDescription">
              Based In Bekasi Kota, Our Products are crafted with utmost care
              100% organic cotton &amp; good vibes
            </p>
            <a href="#" className="read-more-btn">
              Read More <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>

          <div className="card">
            <img src="/Logo Podcast.jpg" className="icon" alt="" />
            <h3 className="h3BusinessName">Podcast Pojok Kantin</h3>
            <p className="pBusinessDescription">
              Podcast komedi yang fokus membahas seputar keseharian masyarakat
              umum dengan pendengar yang didominasi oleh mahasiswa negeri,
              pekerja, dan perantau di Jakarta, dan Jawa Barat
            </p>
            <a href="#" className="read-more-btn">
              Read More <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>

          <div className="card">
            <img src="/Logo Rateku (2).jpg" className="icon" alt="" />
            <h3 className="h3BusinessName">Rateku</h3>
            <p className="pBusinessDescription">
              Influencer Marketing Platform. Pembuatan project ini didasari
              karena banyaknya influencer palsu yang memanipulasi pengikut,
              like, dan komentar.
            </p>
            <a href="#" className="read-more-btn">
              Read More <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>

          <div className="card">
            <img src="/Hambali Logo.jpg" className="icon" alt="" />
            <h3 className="h3BusinessName">Hambali Farm</h3>
            <p className="pBusinessDescription">
              Hambali Farm menyediakan hewan qurban unggul dengan harga terbaik
            </p>
            <a href="#" className="read-more-btn">
              Read More <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <footer>
        <div className="blog-post-container">
          <div className="blog-post-content-header">
            <div className="blog-post-content-header-left">
              <h2>Latest blog</h2>
            </div>
            <div className="blog-post-content-header-right">
              <a href="/blog">View all blogs</a>
            </div>
          </div>

          <div className="blog-post-content-cards">
            {[1, 2, 3].map((i) => (
              <div className="Frame-33" key={i}>
                <img src="/grey2.jpg" alt="" className="blog-image" />
                <div className="description">
                  <div className="tag-date-content">
                    <span className="tag">Digital Transformation</span>
                    <span className="date">20 April 2023</span>
                  </div>
                  <h2>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse pellentesque felis augue, a volutpat justo
                    imperdiet non
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

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
              <h2>Let&apos;s connect!</h2>
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
