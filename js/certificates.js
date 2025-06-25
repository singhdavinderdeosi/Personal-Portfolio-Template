document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cert-container");
  const searchInput = document.getElementById("cert-search");
  const yearSelect = document.getElementById("cert-year");
  const issuerSelect = document.getElementById("cert-issuer");
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalClose = document.querySelector(".close-modal");

  let allCertificates = [];

  // 🔁 Fetch and render certificates
  fetch("data/certificates.json")
    .then(res => res.json())
    .then(data => {
      allCertificates = data;
      populateFilters(data);
      renderCertificates(data);
    })
    .catch(err => console.error("Failed to load certificates:", err));

  // 🧱 Render certificates with flip card & modal preview
  function renderCertificates(certs) {
    container.innerHTML = "";
    if (!certs.length) {
      container.innerHTML = `<p style="color:#aaa;">No certificates found.</p>`;
      return;
    }

    certs.forEach(cert => {
      const card = document.createElement("div");
      card.className = "flip-card fade-in";
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <h3>${cert.name}</h3>
            <p>${cert.issuer} • ${cert.year}</p>
            <p style="font-size: 0.85rem; color:#bbb;">Click to preview</p>
          </div>
          <div class="flip-card-back">
            ${
              cert.link
                ? `<img src="${cert.link}" alt="${cert.name}" class="cert-img" data-src="${cert.link}" loading="lazy" />`
                : `<p>No preview available</p>`
            }
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    observeFadeIn();
    attachImageModalEvents();
  }

  // 🧩 Populate filter options
  function populateFilters(certs) {
    const years = [...new Set(certs.map(c => c.year))].sort((a, b) => b - a);
    const issuers = [...new Set(certs.map(c => c.issuer))].sort();

    years.forEach(y => {
      yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    });

    issuers.forEach(i => {
      issuerSelect.innerHTML += `<option value="${i}">${i}</option>`;
    });
  }

  // 🔎 Filter logic
  function filterCertificates() {
    const keyword = searchInput.value.toLowerCase();
    const selectedYear = yearSelect.value;
    const selectedIssuer = issuerSelect.value;

    const filtered = allCertificates.filter(cert => {
      const matchKeyword =
        cert.name.toLowerCase().includes(keyword) ||
        cert.issuer.toLowerCase().includes(keyword) ||
        cert.year.toString().includes(keyword);

      const matchYear = selectedYear === "all" || cert.year.toString() === selectedYear;
      const matchIssuer = selectedIssuer === "all" || cert.issuer === selectedIssuer;

      return matchKeyword && matchYear && matchIssuer;
    });

    renderCertificates(filtered);
  }

  // 👁️ Scroll fade-in animation
  function observeFadeIn() {
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

  // 🖼️ Modal preview functionality
  function attachImageModalEvents() {
    document.querySelectorAll(".cert-img").forEach(img => {
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.dataset.src || img.src;
        modalImg.alt = img.alt || "Certificate";
      });
    });

    modalClose.addEventListener("click", closeModal);
    window.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Escape") closeModal();
    });
  }

  function closeModal() {
    modal.style.display = "none";
    modalImg.src = "";
    modalImg.alt = "";
  }

  // 🎯 Event Listeners
  searchInput.addEventListener("input", filterCertificates);
  yearSelect.addEventListener("change", filterCertificates);
  issuerSelect.addEventListener("change", filterCertificates);
});
