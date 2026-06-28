window.App.services.storage = {
    keys: {
        READ_STATUS: 'media_library_read_status',
        FAVORITES: 'media_library_favorites',
        LAST_VIEW: 'media_library_last_view'
    },

    init() {
        const readStatus = localStorage.getItem(this.keys.READ_STATUS);
        if (readStatus) {
            window.App.state.readStatus = JSON.parse(readStatus);
        }

        const favorites = localStorage.getItem(this.keys.FAVORITES);
        if (favorites) {
            window.App.state.favorites = JSON.parse(favorites);
        }

        const lastView = localStorage.getItem(this.keys.LAST_VIEW);
        if (lastView) {
            window.App.state.currentView = lastView;
        }
    },

    saveReadStatus(id, status) {
        window.App.state.readStatus[id] = status;
        localStorage.setItem(this.keys.READ_STATUS, JSON.stringify(window.App.state.readStatus));
    },

    getReadStatus(id) {
        return window.App.state.readStatus[id] || 'unread';
    },

    toggleFavorite(id) {
        const index = window.App.state.favorites.indexOf(id);
        if (index > -1) {
            window.App.state.favorites.splice(index, 1);
        } else {
            window.App.state.favorites.push(id);
        }
        localStorage.setItem(this.keys.FAVORITES, JSON.stringify(window.App.state.favorites));
    },

    saveLastView(view) {
        window.App.state.currentView = view;
        localStorage.setItem(this.keys.LAST_VIEW, view);
    }
};
