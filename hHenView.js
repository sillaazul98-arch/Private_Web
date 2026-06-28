window.App.views.hHen = {
    render(container, library, searchQuery = '') {
        this.renderLibrary(container, library, searchQuery);
    },

    renderLibrary(container, library, searchQuery) {
        let filteredLibrary = library;
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filteredLibrary = library.filter(item => 
                item.title.toLowerCase().includes(query)
            );
        }

        if (filteredLibrary.length === 0) {
            container.innerHTML = `
                <div class="loader-container">
                    <p>No se encontraron títulos.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="media-grid fade-in">';
        
        filteredLibrary.forEach(item => {
            html += `
                <div class="media-card" data-id="${item.id}" data-url="${item.contentUrl}" data-title="${item.title}">
                    <div class="media-cover-container">
                        <img src="${item.coverUrl}" alt="Cover" class="media-cover" loading="lazy">
                    </div>
                    <div class="media-info">
                        <h3 class="media-title" title="${item.title}">${item.title}</h3>
                        <div class="media-meta">
                            <span>${item.date}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Add event listeners
        const cards = container.querySelectorAll('.media-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url');
                const title = card.getAttribute('data-title');
                this.renderTitleDetails(container, title, url, library, searchQuery);
            });
        });
    },

    renderTitleDetails(container, title, url, library, searchQuery) {
        let embedUrl = url;

        // Convert /view to /preview for Google Drive file embedding
        if (embedUrl.includes('drive.google.com/file/d/')) {
            embedUrl = embedUrl.replace(/\/view.*$/, '/preview');
        }

        // For Google Drive Folders, the best way to embed is using embeddedfolderview
        const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (folderMatch && folderMatch[1]) {
            embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
        }

        // Clean title: remove any URLs that might have been included
        const cleanTitle = title.replace(/https?:\/\/\S+/g, '').trim();

        container.innerHTML = `
            <div class="title-details" style="height: 100%; display: flex; flex-direction: column; animation: fadeIn var(--transition-normal);">
                <div style="display: flex; align-items: center; margin-bottom: 24px; gap: 16px;">
                    <button id="btn-back-library" class="action-btn">
                        <i class="fa-solid fa-arrow-left"></i> Volver a la Biblioteca
                    </button>
                    <h2>${cleanTitle}</h2>
                </div>
                
                <div class="iframe-container" style="flex: 1; border-radius: 12px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--color-bg-base); box-shadow: var(--shadow-md);">
                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay" allowfullscreen></iframe>
                </div>
            </div>
        `;

        document.getElementById('btn-back-library').addEventListener('click', () => {
            // Animate out (optional, simple render is fine for now)
            this.renderLibrary(container, library, searchQuery);
        });
    }
};
