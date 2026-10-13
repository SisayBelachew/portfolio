
import "./App.css";

function App() {
  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="navbar">
        <h2 className="logo">
          Sisay<span>.</span>
        </h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Home section */}
      <section className="hero" id="home">
        <p className="welcome">WELCOME TO MY PORTFOLIO</p>

        <h1>
          Hi, I'm <span>Sisay Belachew</span>
        </h1>

        <h2>Electrical and Computer Engineering Student</h2>

        <p className="description">
          I am passionate about web development, databases,
          telecommunications, and building useful digital solutions.
        </p>

        <div className="hero-buttons">
          <a className="btn primary" href="#projects">
            View My Projects
          </a>

          <a className="btn secondary" href="#contact">
            Contact Me
          </a>
        </div>
      </section>

      {/* About section */}
      
<section className="section about" id="about">
  <div className="about-content">
    <p className="welcome">GET TO KNOW ME</p>

    <h2>About Me</h2>

    <p>
      I am an Electrical and Computer Engineering student with a strong
      interest in software development, database systems, and
      telecommunications.
    </p>

    <p>
      I enjoy learning new technologies and building practical
      applications. My current focus is developing my skills in React,
      JavaScript, Node.js, Express, MongoDB, and MySQL.
    </p>

    <p>
      My goal is to build reliable digital solutions and continue
      growing in software engineering and data science.
    </p>
  </div>
</section>


      {/* Skills section */}
      
<section className="section skills-section" id="skills">
  <p className="welcome">WHAT I WORK WITH</p>
  <h2>My Technical Skills</h2>

  <p className="section-description">
    Technologies and tools I am learning and using to build practical
    software projects.
  </p>

  <div className="skills">
    <div className="skill">
      <h3>HTML</h3>
      <p>Web page structure</p>
    </div>

    <div className="skill">
      <h3>CSS</h3>
      <p>Web styling and layouts</p>
    </div>

    <div className="skill">
      <h3>JavaScript</h3>
      <p>Programming and interactivity</p>
    </div>

    <div className="skill">
      <h3>React</h3>
      <p>Component-based interfaces</p>
    </div>

    <div className="skill">
      <h3>Node.js</h3>
      <p>Backend development</p>
    </div>

    <div className="skill">
      <h3>MongoDB</h3>
      <p>NoSQL database fundamentals</p>
    </div>

    <div className="skill">
      <h3>MySQL</h3>
      <p>Relational databases and SQL</p>
    </div>

    <div className="skill">
      <h3>Python</h3>
      <p>Programming and data analysis</p>
    </div>
  </div>
</section>


      {/* Projects section */}
      
{/* Projects section */}

<section className="section projects-section" id="projects">
  <p className="welcome">MY RECENT WORK</p>

  <h2>Featured Projects</h2>

  <p className="section-description">
    Here are some projects I am developing to apply my technical skills.
  </p>

  <div className="projects-grid">

    {/* Project 1 */}
    <article className="project-card">
      <div className="project-number">01</div>

      <div className="project-links">
        <a
          href="https://github.com/YOUR_USERNAME/food-ordering-system"
          target="_blank"
          rel="noreferrer"
        >
          View Code
        </a>

        <a
          href="https://YOUR_LIVE_DEMO_URL"
          target="_blank"
          rel="noreferrer"
        >
          Live Demo
        </a>
      </div>

      <h3>Online Food Ordering System</h3>

      <p>
        A web application for a local restaurant where customers can
        browse menus, place orders, and track their orders.
      </p>

      <div className="project-tags">
        <span>React</span>
        <span>Node.js</span>
        <span>MongoDB</span>
      </div>

      <a className="project-link" href="#contact">
        Discuss This Project →
      </a>
    </article>

    {/* Project 2 */}
    <article className="project-card">
      <div className="project-number">02</div>

      <h3>Personal Portfolio Website</h3>

      <p>
        A responsive website that introduces me, presents my skills,
        and showcases my academic and software projects.
      </p>

      <div className="project-tags">
        <span>React</span>
        <span>CSS</span>
        <span>JavaScript</span>
      </div>

      <a className="project-link" href="#contact">
        Discuss This Project →
      </a>
    </article>

    {/* Project 3 */}
    <article className="project-card">
      <div className="project-number">03</div>

      <h3>Database Design Project</h3>

      <p>
        A database design exercise involving entities, relationships,
        data organization, and SQL operations.
      </p>

      <div className="project-tags">
        <span>MySQL</span>
        <span>SQL</span>
        <span>ER Design</span>
      </div>

      <a className="project-link" href="#contact">
        Discuss This Project →
      </a>
    </article>

  </div>
</section>



      {/* Contact section */}
      
<section className="section contact-section" id="contact">
  <p className="welcome">LET'S CONNECT</p>

  <h2>Contact Me</h2>

  <p className="section-description">
    Have a project idea, internship opportunity, or question?
    I'd be happy to hear from you.
  </p>

  <div className="contact-grid">
    <div className="contact-info">
      <h3>Get in Touch</h3>

      <p>
        I'm interested in software development, database systems,
        telecommunications, and learning through practical projects.
      </p>

      <div className="contact-item">
        <span>Email</span>
        <a href="mailto:s96207171@gmail.com">
          s96207171@gmail.com
        </a>
      </div>

      <div className="contact-item">
        <span>Field of Study</span>
        <p>Electrical and Computer Engineering</p>
      </div>
      
      <div className="social-links">
        <a href="https://github.com/codemaster2121!"
           target="_blank"
           rel="noreferrer">
          GitHub
        </a>

        <a href="https://www.linkedin.com/in/YOUR_USERNAME"
           target="_blank"
           rel="noreferrer">
          LinkedIn
        </a>

        <a href="mailto:s96207171@gmail.com">
          Email Me
        </a>
      </div>

    </div>

    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        const name = data.get("name");
        const email = data.get("email");
        const message = data.get("message");

        const subject = encodeURIComponent(
          `Portfolio message from ${name}`
        );

        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        window.location.href =
          `mailto:s96207171@gmail.com?subject=${subject}&body=${body}`;
      }}
    >
      <label htmlFor="name">Your Name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your name"
        required
      />

      <label htmlFor="email">Your Email</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />

      <label htmlFor="message">Your Message</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        placeholder="Write your message..."
        required
      />

      <button type="submit" className="btn primary">
        Send Message
      </button>
    </form>
  </div>
</section>


      {/* Footer */}
      
{/* Footer */}
<footer className="site-footer">
  <div className="footer-content">
    <a href="#home" className="footer-logo">
      Sisay<span>.</span>
    </a>

    <p>
      Building useful digital solutions through technology and continuous learning.
    </p>

    <div className="footer-links">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </div>

    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()} Sisay Belachew. All rights reserved.
      </p>
    </div>
  </div>
</footer>

    </div>
  );
}

export default App;
