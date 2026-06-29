window.App.views.comics = {
    render(container, library, searchQuery = '') {
        // Filter by search query
        let filteredLibrary = library;
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filteredLibrary = library.filter(comic => 
                comic.title.toLowerCase().includes(query) || 
                comic.author.toLowerCase().includes(query)
            );
        }

        if (filteredLibrary.length === 0) {
            container.innerHTML = `
                <div class="loader-container">
                    <p>No se encontraron cómics.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="media-grid">';
        
        filteredLibrary.forEach(comic => {
            const status = window.App.services.storage.getReadStatus(comic.id);
            let statusBadge = '';
            
            if (status === 'read') {
                statusBadge = '<span class="status-badge status-read">Leído</span>';
            } else if (status === 'progress') {
                statusBadge = '<span class="status-badge status-progress">En Progreso</span>';
            } else {
                statusBadge = '<span class="status-badge status-unread">Nuevo</span>';
            }

            const driveMatch = comic.contentUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            const thumbUrl = driveMatch ? `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w300` : '';
            const isHC = comic.id && comic.id.startsWith('h-c-');
            const coverSrc = isHC && thumbUrl ? thumbUrl : (comic.coverUrl || thumbUrl);
            const initial = (comic.title || '?').charAt(0).toUpperCase();

            html += `
                <div class="media-card" data-id="${comic.id}" data-url="${comic.contentUrl}" data-title="${comic.title}">
                    <div class="media-cover-container">
                        <img src="${coverSrc}" alt="Cover" class="media-cover" loading="lazy" decoding="async" referrerpolicy="no-referrer"${thumbUrl ? ` data-fallback="${thumbUrl}"` : ''}>
                        <div class="cover-placeholder" style="display:none">${initial}</div>
                        ${statusBadge}
                    </div>
                    <div class="media-info">
                        <h3 class="media-title" title="${comic.title}">${comic.title}</h3>
                        <div class="media-meta">
                            <span>${comic.author}</span>
                            <span>${comic.date}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Attach event listeners to cards
        const cards = container.querySelectorAll('.media-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const url = card.getAttribute('data-url');
                const title = card.getAttribute('data-title');
                const comic = library.find(c => c.id === id);
                if (comic && comic.pages && comic.pages.length > 0) {
                    window.App.openComicReader(id, title, comic.pages);
                } else {
                    window.App.openReader(id, title, url);
                }
            });
        });

        // Fallback cover images: try Drive thumbnail, then show text placeholder
        container.querySelectorAll('.media-cover').forEach(img => {
            img.addEventListener('error', function() {
                const fb = this.getAttribute('data-fallback');
                const placeholder = this.parentElement?.querySelector('.cover-placeholder');
                if (fb && this.src !== fb) {
                    this.src = fb;
                } else if (placeholder) {
                    this.style.display = 'none';
                    placeholder.style.display = 'flex';
                }
            });
        });
    }
};
