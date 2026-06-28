// Artists view moved here for cleaner separation
window.App.views.artists = {
    render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <i class="fa-solid fa-palette spinner" style="animation: none; font-size: 3rem; margin-bottom: 20px; color: var(--color-text-muted);"></i>
                <h2>Sección de Artistas</h2>
                <p style="margin-top: 10px;">Biblioteca de artistas en desarrollo.</p>
            </div>
        `;
    }
};
