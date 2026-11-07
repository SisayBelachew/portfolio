
import { useState, useEffect } from "react";
import "./App.css";
function App() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTechnologies, setNewTechnologies] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme === null
      ? true
      : savedTheme === "true";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [newName, setNewName] = useState("");
  const [signInMessage, setSignInMessage] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [showMessages, setShowMessages] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeDashboardView, setActiveDashboardView] = useState("overview");
  const [updateMessage, setUpdateMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    technologies: "",
  });
  const [newDepartment, setNewDepartment] = useState("");
  const [newSkills, setNewSkills] = useState("");
  // ADD THE SESSION CHECK HERE
useEffect(() => {
  const checkAdminSession = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/check",
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsAdminLoggedIn(true);
        setShowDashboard(true);
      } else {
        setIsAdminLoggedIn(false);
        setShowDashboard(false);
      }
    } catch (error) {
      console.error("Admin session check failed:", error);
      setIsAdminLoggedIn(false);
      setShowDashboard(false);
    }
  };
  checkAdminSession();
}, []);
  const handleLogout = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Logout failed.");
    }
    setIsAdminLoggedIn(false);
    setShowDashboard(false);
    setActiveDashboardView("overview");
    setSignInMessage("");
    setAdminEmail("");
    setAdminPassword("");
    setShowSignIn(false);
    setShowMessages(false);
    alert("You have successfully logged out.");
  } catch (error) {
    alert(error.message || "Unable to connect to the backend.");
  }
};
const handleContactSubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const messageData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };
  try {
    setContactLoading(true);
    setContactMessage("");
    setContactSuccess(false);
    const response = await fetch(
      "http://localhost:5000/api/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to send message.");
    }
    setContactSuccess(true);
    setContactMessage("Your message was sent successfully!");
    form.reset();
  } catch (error) {
    setContactSuccess(false);
    setContactMessage(error.message || "Something went wrong.");
  } finally {
    setContactLoading(false);
  }
}
const fetchMessages = async () => {
  try {
    setMessagesLoading(true);
    setMessagesError("");

    const response = await fetch(
      "http://localhost:5000/api/messages",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load messages."
      );
    }
    setMessages(data.messages || []);
  } catch (error) {
    setMessagesError(
      error.message || "Unable to load messages."
    );
  } finally {
    setMessagesLoading(false);
  }
};
const handleDeleteMessage = async (messageId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this message?"
  );
  if (!confirmed) return;
  try {
    const response = await fetch(
      `http://localhost:5000/api/messages/${messageId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.message || "Unable to delete message."
      );
    }
    setMessages((currentMessages) =>
      currentMessages.filter(
        (item) => item._id !== messageId
      )
    );
  } catch (error) {
    alert(error.message || "Unable to delete message.");
  }
};
  useEffect(() => {
    fetch("http://localhost:5000/api/profile")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load profile");
        }
        return response.json();
      })
      .then((data) => {
        setProfile(data);
        setNewName(data.name || "");
        setNewDepartment(data.department || "");
        setNewSkills(
        Array.isArray(data.skills)
        ? data.skills.join(", ")
        : ""
    );
    setProfileLoading(false);
      })
      .catch((error) => {
        console.error("Profile error:", error);
        setProfileError("Unable to load profile from the backend.");
      setProfileLoading(false);
      });
  }, []);
  const addProject = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(
      "http://localhost:5000/api/projects",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          technologies: newTechnologies
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean),
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to add project");
    }
    setProjects((previousProjects) => [
      ...previousProjects,
      data.project,
    ]);

    setNewTitle("");
    setNewDescription("");
    setNewTechnologies("");
    alert("Project added successfully!");
  } catch (error) {
    alert(error.message);
  }
};
// Start editing a project
const startEditingProject = (project) => {
  setEditingProjectId(project._id);

  setEditProject({
    title: project.title || "",
    description: project.description || "",
    technologies: project.technologies?.join(", ") || "",
  });
};
// Save edited project to MongoDB
const saveProjectChanges = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(
      `http://localhost:5000/api/projects/${editingProjectId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editProject.title,
          description: editProject.description,
          technologies: editProject.technologies
            .split(",")
            .map((technology) => technology.trim())
            .filter(Boolean),
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update project");
    }
    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project._id === editingProjectId
          ? data.project
          : project
      )
    );
    setEditingProjectId(null);
    alert("Project updated successfully!");
  } catch (error) {
    alert(error.message);
  }
};
// Delete a project from MongoDB
const deleteProject = async (projectId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this project?"
  );
  if (!confirmed) return;
  try {
    const response = await fetch(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete project");
    }
    setProjects((previousProjects) =>
      previousProjects.filter(
        (project) => project._id !== projectId
      )
    );
    alert("Project deleted successfully!");
  } catch (error) {
    alert(error.message);
  }
};
  useEffect(() => {
  async function fetchProjects() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/projects"
      )
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Projects error:", error);
    }
  }
  fetchProjects();
}, []);
  async function updateProfile(event) {
  event.preventDefault();
  setUpdateMessage("");
  try {
    const response = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  name: newName,
  department: newDepartment,
  skills: newSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean),
}),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }
   const updatedProfile = data.profile || data;
setProfile(updatedProfile);
setNewName(updatedProfile.name || "");
setNewDepartment(updatedProfile.department || "");
setNewSkills(
  Array.isArray(updatedProfile.skills)
    ? updatedProfile.skills.join(", ")
    : ""
);
setUpdateMessage("Profile updated successfully!");
  } catch (error) {
    setUpdateMessage(error.message);
  }
}
// Calculate total unique technologies
  const totalTechnologies = [
    ...new Set(
      projects.flatMap(
        (project) => project.technologies || []
      )
    ),
  ].length;
   return (
<div className={`portfolio ${darkMode ? "dark-mode" : "light-mode"}`}>
{showSignIn && (
      <div
        className="signin-overlay"
        onClick={() => setShowSignIn(false)}
      >
        <div
          className="signin-modal"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="signin-close"
            onClick={() => setShowSignIn(false)}
            aria-label="Close sign in form"
          >
            ×
          </button>
          <h2>Admin Sign In</h2>
          <p>Sign in to manage your portfolio projects.</p>
          <form
            onSubmit={async (event) => {
  event.preventDefault();
  setSignInMessage("");
  setSignInLoading(true);
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Sign in failed.");
    }
    setIsAdminLoggedIn(true);
setShowDashboard(true);
setShowSignIn(false);
setSignInMessage("");
setAdminPassword("");
  } catch (error) {
    setSignInMessage(
      error.message || "Unable to connect to the backend."
    );
  } finally {
    setSignInLoading(false);
  }
}}
          >
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="Enter your email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              autoComplete="username"
              required
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter your password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
  type="submit"
  className="signin-submit"
  disabled={signInLoading}
>
  {signInLoading ? "Signing in..." : "Sign In"}
</button>
{signInMessage && (
  <p role="status">{signInMessage}</p>
)}
          </form>
        </div>
      </div>
    )}
     {showDashboard && isAdminLoggedIn ? (
  <section className="admin-dashboard">
    {/* LEFT SIDEBAR */}
    <aside className="dashboard-sidebar">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>
          Welcome to your portfolio management dashboard.
        </p>
      </div>
      {/* SIDEBAR NAVIGATION */}
      <nav className="dashboard-cards">
        <button
          type="button"
          onClick={() => {
            setActiveDashboardView("overview");
            setShowMessages(false);
          }}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveDashboardView("projects");
            setShowMessages(false);
          }}
        >
          Manage Projects
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveDashboardView("profile");
            setShowMessages(false);
          }}
        >
          Manage Profile
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveDashboardView("messages");
            setShowMessages(true);
            fetchMessages();
          }}
        >
          Contact Messages
        </button>
        <button
          type="button"
          onClick={() => {
            setShowDashboard(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          View Portfolio
        </button>
        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
    {/* RIGHT MAIN CONTENT */}
    <main className="dashboard-main">
      {/* OVERVIEW */}
      {activeDashboardView === "overview" && (
        <div className="overview-section">
          <h2>Portfolio Overview</h2>
          <div className="overview-stats">
            <div className="overview-card">
              <h3>Total Projects</h3>
              <p>{projects.length}</p>
            </div>
            <div className="overview-card">
              <h3>Total Messages</h3>
              <p>{messages.length}</p>
            </div>
            <div className="overview-card">
              <h3>Admin Status</h3>
              <p>Logged In</p>
            </div>
            <div className="overview-card">
              <h3>Total Technologies</h3>
              <p>{totalTechnologies}</p>
            </div>
          </div>
        </div>
      )}
      {/* MANAGE PROJECTS */}
      {activeDashboardView === "projects" && (
        <div className="manage-projects-section">
          <h2>Manage Projects</h2>
          <p>
            Add, edit, and delete your portfolio projects.
          </p>
          {/* Add Project Form */}
          <form
            onSubmit={addProject}
            className="add-project-form"
          >
            <h3>Add a New Project</h3>
            <input
              type="text"
              placeholder="Project title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              required
            />
            <textarea
              placeholder="Project description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Technologies (React, Node.js, MongoDB)"
              value={newTechnologies}
              onChange={(event) => setNewTechnologies(event.target.value)}
              required
            />
            <button type="submit">
              Add Project
            </button>
          </form>
          {/* Projects List */}
          <div className="projects-grid">
            {projects.map((project, index) => (
              <article
                className="project-card"
                key={project._id}
              >
                <div className="project-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.technologies?.map((technology) => (
                    <span key={technology}>
                      {technology}
                    </span>
                  ))}
                </div>
                {/* Edit and Delete Buttons */}
                <div className="project-admin-actions">
                  <button
                    type="button"
                    className="edit-project-btn"
                    onClick={() => startEditingProject(project)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-project-btn"
                    onClick={() => deleteProject(project._id)}
                  >
                    Delete
                  </button>
                </div>
                {/* Edit Project Form */}
                {editingProjectId === project._id && (
                  <form
                    className="edit-project-form"
                    onSubmit={saveProjectChanges}
                  >
                    <h4>Edit Project</h4>
                    <input
                      type="text"
                      placeholder="Project title"
                      value={editProject.title}
                      onChange={(event) =>
                        setEditProject({
                          ...editProject,
                          title: event.target.value,
                        })
                      }
                      required
                    />
                    <textarea
                      placeholder="Project description"
                      value={editProject.description}
                      onChange={(event) =>
                        setEditProject({
                          ...editProject,
                          description: event.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Technologies"
                      value={editProject.technologies}
                      onChange={(event) =>
                        setEditProject({
                          ...editProject,
                          technologies: event.target.value,
                        })
                      }
                      required
                    />
                    <button type="submit">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProjectId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
      {/* MANAGE PROFILE */}
      {activeDashboardView === "profile" && (
        <div className="manage-profile-section">
          <h2>Manage Profile</h2>
          <p>
            Update your personal and professional information.
          </p>
          {/* Current Profile */}
          <div className="current-profile-info">
            <h3>Current Profile</h3>
            <p>
              <strong>Name:</strong>{" "}
              {profile?.name || "Not available"}
            </p>
            <p>
              <strong>Department:</strong>{" "}
              {profile?.department || "Not available"}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {profile?.skills?.join(", ") || "Not available"}
            </p>
          </div>
          {/* Update Profile Form */}
          <form
            className="manage-profile-form"
            onSubmit={updateProfile}
          >
            <h3>Update Profile Information</h3>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              required
            />
            <label>Department</label>
            <input
              type="text"
              placeholder="Enter your department"
              value={newDepartment}
              onChange={(event) => setNewDepartment(event.target.value)}
              required
            />
            <label>Professional Skills</label>
            <textarea
              placeholder="React, Node.js, MongoDB, Python, SQL"
              value={newSkills}
              onChange={(event) => setNewSkills(event.target.value)}
              required
            />
            <button type="submit">
              Update Profile
            </button>
            {updateMessage && (
              <p role="status">{updateMessage}</p>
            )}
          </form>
        </div>
      )}
      {/* CONTACT MESSAGES */}
      {activeDashboardView === "messages" && showMessages && (
        <div className="messages-section">
          <h2>Contact Messages</h2>
          <button
            type="button"
            onClick={() => {
              setShowMessages(false);
              setActiveDashboardView("overview");
            }}
          >
            Back to Dashboard
          </button>
          {messagesLoading && (
            <p>Loading messages...</p>
          )}
          {messagesError && (
            <p className="error-message">
              {messagesError}
            </p>
          )}
          {!messagesLoading &&
            !messagesError &&
            messages.length === 0 && (
              <p>No contact messages received yet.</p>
            )}
          {!messagesLoading &&
            !messagesError &&
            messages.map((item) => (
              <div
                className="message-card"
                key={item._id}
              >
                <h3>{item.subject}</h3>
                <p>
                  <strong>Name:</strong> {item.name}
                </p>
                <p>
                  <strong>Email:</strong> {item.email}
                </p>
                <p>
                  <strong>Message:</strong>
                </p>
                <p>{item.message}</p>
                <small>
                  Received:{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </small>
                <div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(item._id)}
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </main>
  </section>
) : (
  <>
{/* Navigation */}
<nav className="navbar">
  <h2 className="logo">
    Sisay<span>.</span>
  </h2>
  {/* Dark/Light Mode Button */}
  <button
    type="button"
    className="theme-toggle"
    onClick={() => {
      setDarkMode((previous) => {
        const newTheme = !previous;
        localStorage.setItem("darkMode", String(newTheme));
        return newTheme;
      });
    }}
  >
    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
  </button>
  {isAdminLoggedIn && (
  <button
    type="button"
    className="signin-button"
    onClick={handleLogout}
  >
    Logout
  </button>
)}
  {/* Mobile Menu Button */}
  <button
    type="button"
    className="menu-toggle"
    onClick={() => setMenuOpen((previous) => !previous)}
    aria-expanded={menuOpen}
    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
  >
    {menuOpen ? "✕" : "☰"}
  </button>
  {/* Navigation Links */}
  <div className={`nav-links ${menuOpen ? "open" : ""}`}>
    <a href="#home" onClick={() => setMenuOpen(false)}>
      Home
    </a>
    <a href="#about" onClick={() => setMenuOpen(false)}>
      About
    </a>
    <a href="#skills" onClick={() => setMenuOpen(false)}>
      Skills
    </a>
    <a href="#projects" onClick={() => setMenuOpen(false)}>
      Projects
    </a>
    <a href="#contact" onClick={() => setMenuOpen(false)}>
      Contact
    </a>
     <a
  href="#signin"
  className="signin-link"
  onClick={(event) => {
    event.preventDefault();
    setShowSignIn(true);
    setMenuOpen(false);
  }}
>
  Sign In
</a>
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
    <div className="backend-profile">
      <h3>Profile Information from My Backend</h3>
      {profileLoading ? (
  <p>Loading profile...</p>
) : profileError ? (
  <p className="profile-error">{profileError}</p>
) : profile ? (
  <>
    <p>
      <strong>Name:</strong> {profile.name}
    </p>
    <p>
      <strong>Department:</strong> {profile.department}
    </p>
    <h4>Skills</h4>
    <ul>
      {Array.isArray(profile.skills) &&
        profile.skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
    </ul>
  </>
) : (
  <p>No profile information available.</p>
)}
</div>
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
<section className="section projects-section" id="projects">
  <p className="welcome">MY RECENT WORK</p>
  <h2>Featured Projects</h2>
  <p className="section-description">
    Here are some projects I am developing to apply my technical skills.
  </p>
  <div className="projects-grid">
  {projects
  .slice(0, showMore ? projects.length : 2)
  .map((project, index) => (
    <article className="project-card" key={project._id}>
      <div className="project-number">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-tags">
        {project.technologies?.map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>
      <div className="project-links">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Code
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live Demo
          </a>
        )}
        <a href="#contact">Contact Me</a>
      </div>
      <a className="project-link" href="#contact">
        Discuss This Project →
      </a>
    </article>
  ))}
</div>
  {/* Show More / Show Less Button */}
  <button
    type="button"
    className="btn primary"
    onClick={() => setShowMore((previous) => !previous)}
    aria-expanded={showMore}
  >
    {showMore ? "Show Less" : "Show More Projects"}
  </button>
</section>
{/* Contact section */}
<section className="section contact-section" id="contact">
  <p className="welcome">LET'S CONNECT</p>
  <h2>Contact Me</h2>
  <p className="section-description">
    Have a project idea, internship opportunity, or question?
    I'd be happy to hear from you.
  </p>
  <div className="contact-links">
    <a href="mailto:s96207171@gmail.com">
      Send Me an Email
    </a>
    <a
      href="https://github.com/codemaster2121"
      target="_blank"
      rel="noopener noreferrer"
    >
      Visit My GitHub
    </a>
  </div>
  <div className="contact-grid">
    {/* Contact Information */}
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
        <a
          href="https://github.com/codemaster2121"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="mailto:s96207171@gmail.com">
          Email Me
        </a>
      </div>
    </div>
    {/* Contact Form */}
    <form
      className="contact-form"
      onSubmit={handleContactSubmit}
    >
      <label htmlFor="contact-name">Your Name</label>
      <input
        id="contact-name"
        name="name"
        type="text"
        placeholder="Enter your name"
        autoComplete="name"
        required
      />
      <label htmlFor="contact-email">Your Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        required
      />
      <label htmlFor="contact-subject">Subject</label>
      <input
        id="contact-subject"
        name="subject"
        type="text"
        placeholder="Enter message subject"
        required
      />
      <label htmlFor="contact-message">Your Message</label>
      <textarea
        id="contact-message"
        name="message"
        rows={5}
        placeholder="Write your message..."
        required
      />
      <button
        type="submit"
        className="btn primary"
        disabled={contactLoading}
      >
        {contactLoading ? "Sending..." : "Send Message"}
      </button>
      {contactMessage && (
        <p
          className={
            contactSuccess
              ? "success-message"
              : "error-message"
          }
        >
          {contactMessage}
        </p>
      )}
    </form>
  </div>
</section>
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
      </>
    )}
  </div>
);
}

export default App;
