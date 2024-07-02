let blogData = [];

const blogGrid = document.getElementById('blogGrid');
const postModal = document.getElementById('postModal');
const modalContent = document.getElementById('modalContent');

function createHighlightedPost(post) {
    const highlightedPost = document.createElement('div');
    highlightedPost.className = 'highlighted-post';
    highlightedPost.innerHTML = `
        <div class="highlighted-post-image loading">
          <img src="${post.image}" alt="${post.title}" onload="this.parentElement.classList.remove('loading')">
        </div>
        <div class="highlighted-post-content">
          <h2 class="highlighted-post-title">${post.title}</h2>
          <p class="highlighted-post-excerpt">${post.excerpt}</p>
          <a href="#" class="read-more" onclick="openModal('${post.id}')">Read More</a>
        </div>
      `;
    return highlightedPost;
}

function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
        <div class="blog-card-image loading">
          <img src="${post.image}" alt="${post.title}" onload="this.parentElement.classList.remove('loading')">
        </div>
        <div class="blog-content">
          <h2 class="blog-title">${post.title}</h2>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="#" class="read-more" onclick="openModal('${post.id}')">Read More</a>
        </div>
      `;
    return card;
}

function renderBlogPosts() {
    // Add highlighted post
    const highlightedPosts = blogData.filter(post => post.highlighted);
    const otherPosts = blogData.filter(post => !post.highlighted);
    highlightedPosts.forEach(post => {
        const highlightedPost = createHighlightedPost(post);
        blogGrid.appendChild(highlightedPost);
    })

    // Add remaining blog posts
    otherPosts.forEach(post => {
        const card = createBlogCard(post);
        blogGrid.appendChild(card);
    });
}

function openModal(postId) {
    const post = blogData.find(p => p.id === postId);
    modalContent.innerHTML = `
        <h2>${post.title}</h2>
        <div class="blog-card-image loading">
          <img src="${post.image}" alt="${post.title}" style="max-width: 100%; height: auto; margin-bottom: 1rem;" onload="this.parentElement.classList.remove('loading')">
        </div>
        <div class='post-meta'>
            <div>
                <p class="post-date"><b>Posted on:</b> ${post.posted}</p>
                <p class="post-author"><b>Author:</b> ${post.author}</p>
            </div>
        </div>
        <blockquote class="post-excerpt">${post.excerpt}</blockquote>
        <p>${post.content}</p>
      `;
    post.parts.forEach(part => {
        const partTitle = document.createElement('h3');
        const partContent = document.createElement('p');
        partTitle.textContent = part.title;
        partContent.textContent = part.content;
        modalContent.appendChild(partTitle);
        modalContent.appendChild(partContent);
    });
    postModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    history.pushState({}, '', `?id=${postId}`);
}

function closeModal() {
    postModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // set query param to empty string
    history.pushState({}, '', window.location.pathname);
}

window.onclick = function (event) {
    if (event.target === postModal) {
        closeModal();
    }
}

function observeBlogPosts() {
    const blogPosts = document.querySelectorAll('.blog-card, .highlighted-post');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Stop observing after animation is applied
            }
        });
    }, { threshold: 0.1 });

    blogPosts.forEach(post => {
        observer.observe(post);
    });
}

function getQueryParams() {
    const params = {};
    const queryString = window.location.search.slice(1);
    const queryArray = queryString.split('&');
    queryArray.forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

function checkAndOpenModal() {
    const params = getQueryParams();
    if (params.id) {
        const post = blogData.find(p => p.id === params.id);
        if (post) {
            openModal(params.id);
        } else {
            showErrorModal('Post not found');
        }
    }
}

function showErrorModal(message) {
    modalContent.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
    `;
    postModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json').then(response => response.json()).then(data => {
        blogData = data;
        renderBlogPosts();
        observeBlogPosts();
        checkAndOpenModal();
    });
    const themeSwitcher = document.getElementById('themeSwitcher');
    themeSwitcher.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    const body = document.body;
    body.classList.add(localStorage.getItem('theme') || 'light');

    themeSwitcher.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        themeSwitcher.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
    });
});
