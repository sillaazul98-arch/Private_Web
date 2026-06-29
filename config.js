window.App = {
    config: {
        henJsonPath: 'El servidor de Patimilechita - H - hen [1466190102995800198].json',
        comicsJsonPath: 'Dbh - Dbh - comics [1510753600786137190].json',
        vJsonPath: 'El servidor de Patimilechita - H - v [1499156011943067658].json',
        appName: 'Private Media Library'
    },
    state: {
        currentView: 'home',
        searchQuery: '',
        sortOrder: 'newest',
        showFavorites: false,
        library: [], // H section items
        comicsLibrary: [], // DB/Comics items
        vLibrary: [], // H/V section items
        cLibrary: [], // H/C section items
        hHenLibrary: [], // H/Hen chapter data
        favorites: [],
        readStatus: {} // { id: 'read' | 'progress' }
    },
    services: {},
    views: {},
    components: {}
};
