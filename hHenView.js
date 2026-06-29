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
            const cleanTitle = item.title.replace(/https?:\/\/\S+/g, '').trim();
            html += `
                <div class="media-card" data-id="${item.id}" data-title="${cleanTitle}">
                    <div class="media-cover-container">
                        <img src="${item.coverUrl}" alt="Cover" class="media-cover" loading="lazy" ${item.coverUrlFallback ? `onerror="this.onerror=null;this.src='${item.coverUrlFallback}'"` : ''}>
                    </div>
                    <div class="media-info">
                        <h3 class="media-title" title="${cleanTitle}">${cleanTitle}</h3>
                        <div class="media-meta">
                            <span>${item.chapters ? item.chapters.length + ' archivos' : ''}</span>
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
                const id = card.getAttribute('data-id');
                const title = card.getAttribute('data-title');
                const item = library.find(i => i.id === id);
                if (item) {
                    this.renderTitleDetails(container, item, library, searchQuery);
                }
            });
        });
    },

    renderTitleDetails(container, item, library, searchQuery) {
        const cleanTitle = item.title.replace(/https?:\/\/\S+/g, '').trim();
        const chapters = item.chapters || [];

        let chaptersHtml = '';
        if (chapters.length === 0) {
            const fileMatch = item.contentUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
            const folderMatch = item.contentUrl.match(/id=([a-zA-Z0-9_-]+)/);
            let embedUrl;
            if (fileMatch) {
                embedUrl = `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
            } else if (folderMatch) {
                embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
            } else {
                embedUrl = item.contentUrl;
            }
            chaptersHtml = `
                <div class="iframe-container" style="height: calc(100vh - 200px); border-radius: 12px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--color-bg-base);">
                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay" allowfullscreen></iframe>
                </div>
            `;
        } else {
            chaptersHtml = '<div class="chapters-grid">';
            chapters.forEach((ch, index) => {
                const thumbUrl = ch.thumb || item.coverUrl;
                chaptersHtml += `
                    <div class="media-card chapter-card" data-chapter-index="${index}" data-file-id="${ch.fileId}" data-file-type="${ch.fileType}">
                        <div class="media-cover-container">
                            <img src="${thumbUrl}" alt="Cover" class="media-cover" loading="lazy">
                        </div>
                        <div class="media-info">
                            <h3 class="media-title" title="${ch.fileName}">${ch.fileName}</h3>
                            <div class="media-meta">
                                <span>${ch.fileType.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            chaptersHtml += '</div>';
        }

        container.innerHTML = `
            <div class="title-details" style="height: 100%; display: flex; flex-direction: column; animation: fadeIn var(--transition-normal);">
                <div style="display: flex; align-items: center; margin-bottom: 24px; gap: 16px;">
                    <button id="btn-back-library" class="action-btn">
                        <i class="fa-solid fa-arrow-left"></i> Volver
                    </button>
                    <h2>${cleanTitle}</h2>
                    <span style="color: var(--text-muted); margin-left: auto;">${chapters.length} archivos</span>
                </div>
                
                <div style="flex: 1; overflow-y: auto;">
                    ${chaptersHtml}
                </div>
            </div>
        `;

        document.getElementById('btn-back-library').addEventListener('click', () => {
            this.renderLibrary(container, library, searchQuery);
        });

        // Chapter click handlers
        const chapterCards = container.querySelectorAll('.chapter-card');
        chapterCards.forEach(card => {
            card.addEventListener('click', () => {
                const fileId = card.getAttribute('data-file-id');
                const fileType = card.getAttribute('data-file-type');
                const chapterIndex = parseInt(card.getAttribute('data-chapter-index'));
                const chapter = chapters[chapterIndex];
                this.openChapterInReader(chapter, item.title);
            });
        });
    },

    openChapterInReader(chapter, seriesTitle) {
        const title = seriesTitle + ' — ' + chapter.fileName;
        // Reuse the existing reader infrastructure in app.js
        window.App.openReader(chapter.fileId, title, `https://drive.google.com/file/d/${chapter.fileId}/preview`);
    }
};
