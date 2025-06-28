document.addEventListener("DOMContentLoaded", () => {
  let allProjects = [];

  const container = document.getElementById("all-projects");
  const searchInput = document.getElementById("project-search");
  const categorySelect = document.getElementById("project-category");

  // Fetch projects.json data
  fetch("data/projects.json")
    .then(res => res.json())
    .then(localProjects => {
      allProjects = [...localProjects];
      renderProjects(allProjects);
      fetchGitHubProjects(); // Fetch GitHub repos after local load
    })
    .catch(err => {
      container.innerHTML = `<p style="color:#f66;">⚠️ Failed to load projects.</p>`;
      console.error("Error loading projects.json:", err);
    });

  // Fetch GitHub repositories
  function fetchGitHubProjects() {
    const username = "YOUR_GITHUB_USERNAME"; // replace with your GitHub username
    fetch(`https://api.github.com/users/${username}/repos`)
      .then(res => res.json())
      .then(repos => {
        const repoProjects = repos.map(repo => ({
          title: repo.name,
          description: repo.description || "No description provided.",
          link: repo.html_url,
          category: "github"
        }));
        allProjects = [...allProjects, ...repoProjects];
        renderProjects(allProjects);
      })
      .catch(err => {
        console.error("Error fetching GitHub repositories:", err);
      });
  }

  // Render projects to DOM
  function renderProjects(projects) {
    container.innerHTML = "";

    if (!projects.length) {
      container.innerHTML = `<p style="color:#aaa;">No projects found.</p>`;
      return;
    }

    container.innerHTML = projects.map(project => `
      <div class="card fade-in">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a>
      </div>
    `).join("");

    animateFadeIn();
  }

  // Fade-in animation
  function animateFadeIn() {
    const fadeElements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));
  }

  // Filter projects by keyword + category
  function filterProjects() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value.toLowerCase();

    const filtered = allProjects.filter(project => {
      const matchesKeyword = project.title.toLowerCase().includes(keyword) ||
                             project.description.toLowerCase().includes(keyword);
      const matchesCategory = selectedCategory === "all" ||
                              (project.category || "").toLowerCase() === selectedCategory;
      return matchesKeyword && matchesCategory;
    });

    renderProjects(filtered);
  }

  // Debounce utility
  function debounce(fn, delay = 250) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Event listeners
  searchInput.addEventListener("input", debounce(filterProjects));
  categorySelect.addEventListener("change", filterProjects);
});
