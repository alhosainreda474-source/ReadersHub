let publishersData = [];
let videosData = JSON.parse(localStorage.getItem("readersHubPosts")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const videoListContainer = document.querySelector(".video-list");
  const sidebarPublishersList = document.getElementById(
    "sidebarPublishersList",
  );
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const pageTitle = document.getElementById("pageTitle");
  const myBooksLink = document.getElementById("myBooksLink");

  function renderSidebarPublishers() {
    if (!sidebarPublishersList) return;
    if (publishersData.length === 0) {
      sidebarPublishersList.innerHTML = `<span style="font-size: 0.85rem; color: var(--secondary-color); padding: 0.4rem 0.75rem;">لا توجد جهات نشر حالياً</span>`;
      return;
    }
    sidebarPublishersList.innerHTML = publishersData
      .slice(0, 5)
      .map(
        (pub) => `
      <a href="#" class="sidebar-link publisher-filter" data-publisher="${pub.name}">
        <img src="${pub.logo}" alt="${pub.name}" class="publisher-avatar" />
        <span class="link-label">${pub.name}</span>
      </a>
    `,
      )
      .join("");
  }

  function renderVideos(items) {
    if (!videoListContainer) return;
    if (items.length === 0) {
      videoListContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--secondary-color); padding: 4rem; font-size: 1.1rem;">لا توجد منشورات حالياً. ابدأ بنشر كتاب أو مراجعة جديدة!</p>`;
      return;
    }

    videoListContainer.innerHTML = items
      .map(
        (video) => `
      <div class="video-card" data-id="${video.id}">
        <div class="thumbnail-container">
          <img src="${video.thumbnail}" alt="thumbnail" class="thumbnail" />
        </div>
        <div class="video-info">
          <img src="${video.channelLogo}" alt="${video.channelName}" class="channel-icon" />
          <div class="video-details" style="flex: 1;">
            <h3 class="title">${video.title}</h3>
            <p class="channel-name" data-publisher="${video.channelName}">${video.channelName}</p>
            <p class="views-date">${video.viewsDate}</p>
          </div>
          ${video.isUserPost ? `<button class="delete-post-btn" data-id="${video.id}" title="حذف المنشور" style="background:none; border:none; color: #ff4d4d; cursor:pointer; font-size: 1.1rem; padding: 5px;"><i class="uil uil-trash-alt"></i></button>` : ""}
        </div>
      </div>
    `,
      )
      .join("");

    attachCardEvents();
  }

  function updatePublishersFromPosts() {
    const uniquePublishers = {};
    videosData.forEach((video) => {
      if (!uniquePublishers[video.channelName]) {
        uniquePublishers[video.channelName] = {
          id: Date.now() + Math.random(),
          name: video.channelName,
          logo: video.channelLogo,
        };
      }
    });
    publishersData = Object.values(uniquePublishers);
    renderSidebarPublishers();
  }

  updatePublishersFromPosts();
  renderVideos(videosData);

  if (myBooksLink) {
    myBooksLink.addEventListener("click", (e) => {
      e.preventDefault();
      const currentUser = localStorage.getItem("readersHubUser");
      if (!currentUser) {
        alert("الرجاء تسجيل الدخول أولاً لعرض منشوراتك.");
        return;
      }
      const myPosts = videosData.filter(
        (item) => item.channelName === currentUser || item.isUserPost,
      );
      pageTitle.textContent = `منشوراتي الخاصة (${currentUser})`;
      renderVideos(myPosts);
    });
  }

  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-post-btn");
    if (deleteBtn) {
      e.stopPropagation();
      const id = deleteBtn.getAttribute("data-id");
      if (confirm("هل أنت متأكد من رغبتك في مسح هذا المنشور؟")) {
        videosData = videosData.filter((item) => item.id != id);
        localStorage.setItem("readersHubPosts", JSON.stringify(videosData));
        updatePublishersFromPosts();
        renderVideos(videosData);
        alert("تم مسح المنشور بنجاح.");
      }
    }
  });

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      const filtered = videosData.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.channelName.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
      pageTitle.textContent = `نتائج البحث عن: "${searchInput.value}"`;
      renderVideos(filtered);
    });
  }

  document.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("publisher-filter") ||
      e.target.classList.contains("channel-name")
    ) {
      e.preventDefault();
      const publisherName = e.target.getAttribute("data-publisher");
      const publisherPosts = videosData.filter(
        (item) => item.channelName === publisherName,
      );
      pageTitle.textContent = `صفحة الناشر / الكاتب: ${publisherName}`;
      renderVideos(publisherPosts);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // زر القائمة بجانب الشعار (يعمل على الكمبيوتر والموبايل بدقة)
  const menuButton = document.querySelector(".menu-button");
  const sidebar = document.querySelector(".sidebar");
  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle("active-mobile");
      } else {
        sidebar.classList.toggle("collapsed");
      }
    });
  }

  function attachCardEvents() {
    const modalOverlay = document.getElementById("postModal");
    const modalBody = document.querySelector(".modal-body");
    const closeModalBtn = document.querySelector(".close-modal-btn");
    const videoCards = document.querySelectorAll(".video-card");

    videoCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("channel-name") ||
          e.target.closest(".delete-post-btn")
        )
          return;

        const id = card.getAttribute("data-id");
        const data = videosData.find((item) => item.id == id);
        if (!data) return;

        modalBody.innerHTML = `
          <img src="${data.thumbnail}" alt="Cover" class="modal-image" />
          <h2 class="modal-title">${data.title}</h2>
          <div class="modal-author">
            <img src="${data.channelLogo}" alt="Author" />
            <div>
              <strong class="channel-name" style="cursor:pointer;" data-publisher="${data.channelName}">${data.channelName}</strong>
              <p style="font-size: 0.8rem; margin-top: 2px;">${data.viewsDate}</p>
            </div>
          </div>
          <p style="color: var(--black-color); line-height: 1.6; font-size: 0.95rem;">
            ${data.description}
          </p>
        `;

        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove("active");
          document.body.style.overflow = "auto";
        }
      });
    }
  }

  const uploadModal = document.getElementById("uploadModal");
  const openUploadBtn = document.getElementById("openUploadBtn");
  const closeUploadModal = document.getElementById("closeUploadModal");
  const uploadForm = document.getElementById("uploadForm");

  const authModal = document.getElementById("authModal");
  const authBtn = document.getElementById("authBtn");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const loginForm = document.getElementById("loginForm");

  let currentUser = localStorage.getItem("readersHubUser");
  updateAuthUI();

  openUploadBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("الرجاء تسجيل الدخول أولاً لتتمكن من نشر الكتب والمراجعات.");
      authModal.classList.add("active");
    } else {
      uploadModal.classList.add("active");
    }
  });

  closeUploadModal.addEventListener("click", () =>
    uploadModal.classList.remove("active"),
  );

  authBtn.addEventListener("click", () => {
    if (currentUser) {
      if (confirm("هل تريد تسجيل الخروج؟")) {
        localStorage.removeItem("readersHubUser");
        currentUser = null;
        updateAuthUI();
      }
    } else {
      authModal.classList.add("active");
    }
  });

  closeAuthModal.addEventListener("click", () =>
    authModal.classList.remove("active"),
  );

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    currentUser = email.split("@")[0];
    localStorage.setItem("readersHubUser", currentUser);
    authModal.classList.remove("active");
    updateAuthUI();
    alert(`مرحباً بك يا ${currentUser}! تم تسجيل الدخول بنجاح.`);
  });

  function updateAuthUI() {
    if (currentUser) {
      authBtn.textContent = "خروج";
      authBtn.style.borderColor = "var(--secondary-color)";
      authBtn.style.color = "var(--secondary-color)";
    } else {
      authBtn.textContent = "تسجيل الدخول";
      authBtn.style.borderColor = "var(--primary-color)";
      authBtn.style.color = "var(--primary-color)";
    }
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("bookTitleInput").value;
      const desc = document.getElementById("bookDescInput").value;

      const aiCheck = smartFilterCheck(title, desc);
      if (!aiCheck.isValid) {
        alert(aiCheck.message);
        return;
      }

      const author = currentUser;
      const image = document.getElementById("imageInput").value;

      const newPost = {
        id: Date.now(),
        thumbnail: image,
        channelLogo: `https://api.dicebear.com/7.x/identicon/svg?seed=${author}`,
        title: title,
        channelName: author,
        viewsDate: "منشور جديد • موثق",
        description: desc,
        isUserPost: true,
      };

      videosData.unshift(newPost);
      localStorage.setItem("readersHubPosts", JSON.stringify(videosData));

      uploadModal.classList.remove("active");
      uploadForm.reset();
      pageTitle.textContent = "أحدث المنشورات والكتب";
      updatePublishersFromPosts();
      renderVideos(videosData);
      alert(aiCheck.message);
    });
  }

  const themeButton = document.querySelector(".theme-button");
  const themeIcon = themeButton ? themeButton.querySelector("i") : null;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.classList.replace("uil-moon", "uil-sun");
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDarkMode = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      if (themeIcon) {
        isDarkMode
          ? themeIcon.classList.replace("uil-moon", "uil-sun")
          : themeIcon.classList.replace("uil-sun", "uil-moon");
      }
    });
  }
});
