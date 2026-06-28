window.App.views.videos = {
    render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <i class="fa-solid fa-film spinner" style="animation: none; font-size: 3rem; margin-bottom: 20px; color: var(--color-text-muted);"></i>
                <h2>Sección de Videos</h2>
                <p style="margin-top: 10px;">Esta sección está preparada para conectarse a un futuro archivo JSON de videos.</p>
            </div>
        `;
    }
};

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

window.App.views.placeholder = {
    render(container, title) {
        container.innerHTML = `
            <div class="loader-container">
                <i class="fa-solid fa-lock spinner" style="animation: none; font-size: 3rem; margin-bottom: 20px; color: var(--color-text-muted);"></i>
                <h2>Sección ${title}</h2>
                <p style="margin-top: 10px;">Esta sección está protegida y reservada para futuras funcionalidades.</p>
            </div>
        `;
    }
};
