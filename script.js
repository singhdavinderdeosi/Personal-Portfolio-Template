document.addEventListener("DOMContentLoaded", () => {
  // 🔄 Fade-In + Zoom Animations
  const fadeElements = document.querySelectorAll(".fade-in, .zoom-in");
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  fadeElements.forEach(el => fadeObserver.observe(el));

  // 📌 Hide & Reveal Floating Pill Navbar on Scroll
  const navbar = document.getElementById("navbar");
  let lastScrollTop = 0;

  if (navbar) {
    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      if (currentScroll > lastScrollTop) {
        navbar.style.top = "-100px"; // Hide
      } else {
        navbar.style.top = "20px"; // Show
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
  }

  // 📊 Scroll Progress Bar
  const scrollBar = document.getElementById("scroll-progress");
  if (scrollBar) {
    window.addEventListener("scroll", () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = `${(top / height) * 100}%`;
    });
  }

  // 🎯 Typing Text Effect
  const textArray = [
    "Django Developer ",
    "Python Programmer ",
    "Cybersecurity Enthusiast "
  ];
  const typingElement = document.getElementById("typing");
  if (typingElement) {
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentText = textArray[textIndex];
      const partialText = currentText.substring(0, charIndex);
      typingElement.textContent = partialText;

      let typeSpeed = 100;

      if (!isDeleting && charIndex < currentText.length) {
        charIndex++;
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        typeSpeed = 50;
      }

      if (charIndex === currentText.length) {
        typeSpeed = 1500;
        isDeleting = true;
      } else if (charIndex === 0 && isDeleting) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };

    type();
  }

  // 📦 Render Cards Helper
  const renderCards = (url, containerId, limit, template) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById(containerId);
        if (!container) return;
        data.slice(0, limit).forEach(item => {
          container.innerHTML += template(item);
        });
      })
      .catch(err => console.error(`Failed to load ${containerId}:`, err));
  };

  // ✅ Homepage Sections
  renderCards("data/projects.json", "project-list", 3, project => `
    <div class="card fade-in">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <a href="${project.link}" target="_blank">View Project</a>
    </div>
  `);

  renderCards("data/certificates.json", "cert-list", 3, cert => `
    <div class="card fade-in">
      <h3>${cert.name}</h3>
      <p>${cert.issuer} • ${cert.year}</p>
    </div>
  `);

  // 🎯 Skills Section
  const skillContainer = document.getElementById("skill-list");
  const toggleSkillBtn = document.getElementById("toggle-skill-btn");
  let allSkills = [];
  let showingAllSkills = false;

  function renderSkills(limit = 3) {
    skillContainer.innerHTML = "";
    const levelMap = {
      "Basic": "40%",
      "Intermediate": "60%",
      "Proficient": "75%",
      "Advanced": "90%"
    };

    allSkills.slice(0, limit).forEach(skill => {
      const width = levelMap[skill.level] || "50%";
      skillContainer.innerHTML += `
        <div class="skill-bar fade-in">
          <h3>${skill.name} <span style="float:right;">${skill.level}</span></h3>
          <div class="progress">
            <div class="progress-fill" style="--progress: ${width}; width: ${width};"></div>
          </div>
        </div>
      `;
    });

    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach(el => el.classList.remove("visible"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
  }

  fetch("data/skill.json")
    .then(res => res.json())
    .then(data => {
      allSkills = data;
      renderSkills();
    })
    .catch(err => {
      if (skillContainer)
        skillContainer.innerHTML = `<p style="color:#f66;">Failed to load skills.</p>`;
      console.error("Error loading skill.json:", err);
    });

  if (toggleSkillBtn) {
    toggleSkillBtn.addEventListener("click", () => {
      showingAllSkills = !showingAllSkills;
      renderSkills(showingAllSkills ? allSkills.length : 3);
      toggleSkillBtn.textContent = showingAllSkills ? "Show Less Skills" : "Show All Skills";
    });
  }

  // 🌐 GitHub API
  const githubContainer = document.getElementById("github-repo-list");
  if (githubContainer) {
    const GITHUB_USERNAME = "singhdavinderdeosi";
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`)
      .then(res => res.json())
      .then(data => {
        const topRepos = data
          .filter(repo => !repo.fork && repo.description)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 3);
        topRepos.forEach(repo => {
          githubContainer.innerHTML += `
            <div class="card fade-in">
              <h3>${repo.name}</h3>
              <p>${repo.description}</p>
              <a href="${repo.html_url}" target="_blank">⭐ ${repo.stargazers_count} stars</a>
            </div>
          `;
        });
      })
      .catch(err => console.warn("GitHub repos could not be loaded:", err));
  }

  // 📜 Certificates Page Filters
  if (document.getElementById("cert-container")) {
    const certContainer = document.getElementById("cert-container");
    const searchInput = document.getElementById("cert-search");
    const yearSelect = document.getElementById("cert-year");
    const issuerSelect = document.getElementById("cert-issuer");
    let allCerts = [];

    fetch("data/certificates.json")
      .then(res => res.json())
      .then(data => {
        allCerts = data;
        populateFilters(data);
        renderAllCerts(data);
      });

    function populateFilters(data) {
      const years = [...new Set(data.map(c => c.year))].sort().reverse();
      const issuers = [...new Set(data.map(c => c.issuer))].sort();
      years.forEach(y => yearSelect.innerHTML += `<option value="${y}">${y}</option>`);
      issuers.forEach(i => issuerSelect.innerHTML += `<option value="${i}">${i}</option>`);
    }

    function renderAllCerts(list) {
      certContainer.innerHTML = "";
      if (list.length === 0) {
        certContainer.innerHTML = `<p style="color:#aaa;">No certificates found.</p>`;
        return;
      }
      list.forEach(cert => {
        certContainer.innerHTML += `
          <div class="card fade-in">
            <h3>${cert.name}</h3>
            <p>${cert.issuer} • ${cert.year}</p>
          </div>
        `;
      });
    }

    function filterCerts() {
      const keyword = searchInput.value.toLowerCase();
      const year = yearSelect.value;
      const issuer = issuerSelect.value;

      const filtered = allCerts.filter(c => {
        const matchKeyword = c.name.toLowerCase().includes(keyword);
        const matchYear = year === "all" || c.year.toString() === year;
        const matchIssuer = issuer === "all" || c.issuer === issuer;
        return matchKeyword && matchYear && matchIssuer;
      });

      renderAllCerts(filtered);
    }

    searchInput.addEventListener("input", filterCerts);
    yearSelect.addEventListener("change", filterCerts);
    issuerSelect.addEventListener("change", filterCerts);
  }

  // 🔗 Smooth Scroll for Internal Hero Buttons
  document.querySelectorAll(".cta-buttons a[href^='#']").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // 📱 Mobile Nav Toggle (if used in future)
  const toggleBtn = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }
});
