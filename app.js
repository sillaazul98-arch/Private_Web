// Login Gate
(function() {
    const loginScreen = document.getElementById('login-screen');
    const loginInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const app = document.getElementById('app');

    // Already authenticated this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        loginScreen.classList.add('hidden');
        app.classList.remove('hidden');
        return;
    }

    function checkPassword() {
        if (loginInput.value === 'sillaazul98') {
            sessionStorage.setItem('authenticated', 'true');
            loginScreen.classList.add('hidden');
            app.classList.remove('hidden');
        } else {
            loginError.classList.remove('hidden');
            loginInput.value = '';
            loginInput.focus();
        }
    }

    loginBtn.addEventListener('click', checkPassword);
    loginInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
})();

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Storage
    window.App.services.storage.init();

    // DOM Elements
    const viewsContainer = document.getElementById('views-container');
    const searchInput = document.getElementById('global-search');
    const breadcrumbRoot = document.getElementById('breadcrumb-root');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    
    // Modal Elements
    const readerModal = document.getElementById('reader-modal');
    const readerBody = document.getElementById('reader-body');
    const readerTitle = document.getElementById('reader-title');
    const btnCloseReader = document.getElementById('btn-close-reader');
    const btnMarkRead = document.getElementById('btn-mark-read');

    // Current Reader State
    let currentReaderId = null;

    // 1b. Sidebar Toggle (mobile)
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const hamburgerBtn = document.getElementById('hamburger-btn');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('visible');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
    }

    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar on nav click (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        });
    });

    // 2. Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    
    function updateBreadcrumbs(viewId) {
        let root = 'DB';
        let current = 'Comics';

        if (viewId === 'home') {
            root = 'General';
            current = 'Inicio';
        } else if (viewId.startsWith('h-')) {
            root = 'H';
            current = viewId.replace('h-', '').toUpperCase();
        } else {
            root = 'DB';
            current = viewId.charAt(0).toUpperCase() + viewId.slice(1);
        }

        breadcrumbRoot.textContent = root;
        breadcrumbCurrent.textContent = current;
    }

    async function switchView(viewId) {
        // Update State
        window.App.state.currentView = viewId;
        window.App.services.storage.saveLastView(viewId);
        
        // Update UI active class
        navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Breadcrumbs
        updateBreadcrumbs(viewId);

        // Set data-view attribute for CSS targeting
        viewsContainer.dataset.view = viewId;

        // Render appropriate view
        if (viewId === 'home') {
            viewsContainer.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.05;"><i class="fa-solid fa-layer-group" style="font-size: 15vw;"></i></div>';
        } else if (viewId === 'h-hen') {
            if (!window.App.state.hHenLibrary || window.App.state.hHenLibrary.length === 0) {
                await loadHHenData();
            }
            window.App.views.hHen.render(viewsContainer, sortLibrary(window.App.state.hHenLibrary), window.App.state.searchQuery);
        } else if (viewId === 'h-v') {
            window.App.views.hHen.render(viewsContainer, sortLibrary(window.App.state.vLibrary), window.App.state.searchQuery);
        } else if (viewId === 'comics') {
            window.App.views.comics.render(viewsContainer, sortLibrary(window.App.state.comicsLibrary), window.App.state.searchQuery);
        } else if (viewId === 'h-c') {
            if (!window.App.state.cLibrary || window.App.state.cLibrary.length === 0) {
                await loadCData();
            }
            window.App.views.comics.render(viewsContainer, sortLibrary(window.App.state.cLibrary), window.App.state.searchQuery);
        } else if (viewId === 'videos') {
            window.App.views.videos.render(viewsContainer);
        } else if (viewId === 'artists') {
            window.App.views.artists.render(viewsContainer);
        } else {
            // H section placeholders
            window.App.views.placeholder.render(viewsContainer, viewId.replace('h-', '').toUpperCase());
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            await switchView(viewId);
        });
    });

    // Sort Logic
    function sortLibrary(library) {
        if (!library) return [];
        const sorted = [...library];
        if (window.App.state.sortOrder === 'newest') {
            sorted.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            sorted.sort((a, b) => a.timestamp - b.timestamp);
        }
        return sorted;
    }

    function getFilteredLibrary(library) {
        if (!library) return [];
        let filtered = library;
        if (window.App.state.showFavorites) {
            filtered = filtered.filter(item => window.App.state.favorites.includes(item.id));
        }
        return filtered;
    }

    // Lazy-load H/C data only when needed
    let cDataLoading = null;
    function loadCData() {
        if (window.App.config.cData) return Promise.resolve();
        if (cDataLoading) return cDataLoading;
        cDataLoading = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'hCData.js';
            script.onload = () => {
                window.App.state.cLibrary = window.App.config.cData || [];
                resolve();
            };
            script.onerror = () => {
                window.App.state.cLibrary = [];
                resolve();
            };
            document.head.appendChild(script);
        });
        return cDataLoading;
    }

    // Lazy-load H/Hen data (chapters) only when needed
    let hHenDataLoading = null;
    function loadHHenData() {
        if (window.App.config.hHenData) return Promise.resolve();
        if (hHenDataLoading) return hHenDataLoading;
        hHenDataLoading = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'hHenData.js';
            script.onload = () => {
                window.App.state.hHenLibrary = window.App.config.hHenData || [];
                resolve();
            };
            script.onerror = () => {
                window.App.state.hHenLibrary = [];
                resolve();
            };
            document.head.appendChild(script);
        });
        return hHenDataLoading;
    }

    function reRenderCurrentView() {
        const viewId = window.App.state.currentView;
        if (viewId === 'h-hen') {
            window.App.views.hHen.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.hHenLibrary)), window.App.state.searchQuery);
        } else if (viewId === 'h-v') {
            window.App.views.hHen.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.vLibrary)), window.App.state.searchQuery);
        } else if (viewId === 'comics') {
            window.App.views.comics.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.comicsLibrary)), window.App.state.searchQuery);
        } else if (viewId === 'h-c') {
            window.App.views.comics.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.cLibrary)), window.App.state.searchQuery);
        }
    }

    // Sort buttons
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sort = btn.getAttribute('data-sort');
            window.App.state.sortOrder = sort;
            sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            reRenderCurrentView();
        });
    });

    // Quick action buttons
    const btnFavorites = document.querySelector('.quick-actions .icon-btn[title="Favoritos"]');
    const btnHistory = document.querySelector('.quick-actions .icon-btn[title="Historial"]');
    const btnSettings = document.querySelector('.quick-actions .icon-btn[title="Configuración"]');

    btnFavorites.addEventListener('click', () => {
        window.App.state.showFavorites = !window.App.state.showFavorites;
        btnFavorites.style.color = window.App.state.showFavorites ? 'var(--color-warning)' : '';
        reRenderCurrentView();
    });

    btnHistory.addEventListener('click', () => {
        viewsContainer.innerHTML = `
            <div class="loader-container">
                <i class="fa-solid fa-clock-rotate-left spinner" style="animation: none; font-size: 3rem; margin-bottom: 20px; color: var(--color-text-muted);"></i>
                <h2>Historial</h2>
                <p style="margin-top: 10px;">Función en desarrollo.</p>
            </div>
        `;
    });

    btnSettings.addEventListener('click', () => {
        viewsContainer.innerHTML = `
            <div class="loader-container">
                <i class="fa-solid fa-gear spinner" style="animation: none; font-size: 3rem; margin-bottom: 20px; color: var(--color-text-muted);"></i>
                <h2>Configuración</h2>
                <p style="margin-top: 10px;">Panel de configuración próximamente.</p>
            </div>
        `;
    });

    // 3. Search Logic
    searchInput.addEventListener('input', (e) => {
        window.App.state.searchQuery = e.target.value;
        const viewId = window.App.state.currentView;
        if (viewId === 'h-hen') {
            window.App.views.hHen.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.library)), window.App.state.searchQuery);
        } else if (viewId === 'h-v') {
            window.App.views.hHen.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.vLibrary)), window.App.state.searchQuery);
        } else if (viewId === 'comics') {
            window.App.views.comics.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.comicsLibrary)), window.App.state.searchQuery);
        } else if (viewId === 'h-c') {
            window.App.views.comics.render(viewsContainer, sortLibrary(getFilteredLibrary(window.App.state.cLibrary)), window.App.state.searchQuery);
        }
    });

    // 4. Reader Modal Logic
    window.App.openComicReader = function(id, title, url) {
        window.App.openReader(id, title, url);
    };

    window.App.openReader = function(id, title, url) {
        currentReaderId = id;
        readerTitle.textContent = title;
        
        // Update read status to 'progress' if it was unread
        const currentStatus = window.App.services.storage.getReadStatus(id);
        if (currentStatus !== 'read') {
            window.App.services.storage.saveReadStatus(id, 'progress');
            btnMarkRead.innerHTML = '<i class="fa-solid fa-check"></i><span class="btn-label"> Marcar Leído</span>';
            btnMarkRead.classList.remove('read');
        } else {
            btnMarkRead.innerHTML = '<i class="fa-solid fa-check-double"></i><span class="btn-label"> Leído</span>';
            btnMarkRead.classList.add('read');
        }

        // Fix Google Drive URLs for iframe embedding
        // Replace /view with /preview to avoid access/cookie issues in iframes
        let embedUrl = url;
        if (embedUrl.includes('drive.google.com/file/d/')) {
            embedUrl = embedUrl.replace(/\/view.*$/, '/preview');
        }

        readerBody.innerHTML = `<iframe src="${embedUrl}" allow="autoplay" allowfullscreen></iframe>`;
        
        readerModal.classList.remove('hidden');
    };

    function closeReader() {
        readerModal.classList.add('hidden');
        readerBody.innerHTML = '';
        currentReaderId = null;
        
        reRenderCurrentView();
    }

    btnCloseReader.addEventListener('click', closeReader);

    btnMarkRead.addEventListener('click', () => {
        if (!currentReaderId) return;
        
        const currentStatus = window.App.services.storage.getReadStatus(currentReaderId);
        if (currentStatus !== 'read') {
            window.App.services.storage.saveReadStatus(currentReaderId, 'read');
            btnMarkRead.innerHTML = '<i class="fa-solid fa-check-double"></i><span class="btn-label"> Leído</span>';
            btnMarkRead.classList.add('read');
        } else {
            window.App.services.storage.saveReadStatus(currentReaderId, 'progress');
            btnMarkRead.innerHTML = '<i class="fa-solid fa-check"></i><span class="btn-label"> Marcar Leído</span>';
            btnMarkRead.classList.remove('read');
        }
    });

    // 5. Scroll to Top Logic
    const btnScrollToTop = document.getElementById('scroll-to-top');
    viewsContainer.addEventListener('scroll', () => {
        if (viewsContainer.scrollTop > 200) {
            btnScrollToTop.classList.remove('hidden');
        } else {
            btnScrollToTop.classList.add('hidden');
        }
    });

    btnScrollToTop.addEventListener('click', () => {
        viewsContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 6. Initial Load
    // Show loader
    viewsContainer.innerHTML = `
        <div class="loader-container">
            <i class="fa-solid fa-circle-notch spinner"></i>
            <p>Cargando biblioteca...</p>
        </div>
    `;

    // Fetch JSON
    const [henLibrary, comicsLibrary, vLibrary] = await Promise.all([
        window.App.services.jsonParser.loadFromPath(window.App.config.henJsonPath, 'hen'),
        window.App.services.jsonParser.loadFromPath(window.App.config.comicsJsonPath, 'comics'),
        window.App.services.jsonParser.loadFromPath(window.App.config.vJsonPath, 'v')
    ]);
    window.App.state.library = henLibrary;
    window.App.state.comicsLibrary = comicsLibrary;
    window.App.state.vLibrary = vLibrary;

    // Apply last view or default to comics
    await switchView(window.App.state.currentView);
});
