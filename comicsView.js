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

            html += `
                <div class="media-card" data-id="${comic.id}" data-url="${comic.contentUrl}" data-title="${comic.title}">
                    <div class="media-cover-container">
                        <img src="${comic.coverUrl}" alt="Cover" class="media-cover" loading="lazy">
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
    }
};
