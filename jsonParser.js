window.App.services.jsonParser = {
    async loadFromPath(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return this.parseMessages(data.messages || []);
        } catch (error) {
            console.error(`Error loading JSON from ${path}:`, error);
            if (window.location.protocol === 'file:') {
                alert("Error: No se pudo cargar el archivo JSON. Si abriste index.html directamente (file://), los navegadores bloquean la lectura de archivos por seguridad (CORS). Necesitas un servidor local o usar una extensión como Live Server en VS Code.");
            }
            return [];
        }
    },

    async loadLibrary() {
        return this.loadFromPath(window.App.config.henJsonPath);
    },

    parseMessages(messages) {
        const library = [];
        
        messages.forEach(msg => {
            // Only process messages that have a drive link in content and an attachment (cover)
            if (msg.content && msg.content.includes("drive.google.com") && msg.attachments && msg.attachments.length > 0) {
                const cover = msg.attachments[0];
                let title = "Unknown Comic";
                
                // Try to extract title from content (Text before URL)
                if (msg.content) {
                    const lines = msg.content.split('\n');
                    if (lines.length > 0 && !lines[0].startsWith('http')) {
                        title = lines[0].trim();
                    }
                }
                
                // Fallbacks
                if (title === "Unknown Comic" || title === "") {
                    if (msg.embeds && msg.embeds.length > 0 && msg.embeds[0].title) {
                        title = msg.embeds[0].title.replace('.pdf', '');
                    } else if (cover.fileName) {
                        title = cover.fileName.split('.')[0];
                    }
                }

                // Extract just the URL from content, not the full message text
                const urlMatch = msg.content.match(/https:\/\/drive\.google\.com[^\s]*/);
                const contentUrl = urlMatch ? urlMatch[0] : msg.content;

                // Use Google Drive thumbnail as primary cover (permanent, doesn't expire)
                const driveIdMatch = contentUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                let coverUrl = cover.url;
                let coverUrlFallback = null;
                if (driveIdMatch) {
                    coverUrl = `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w400`;
                    coverUrlFallback = cover.url;
                }

                library.push({
                    id: msg.id,
                    title: title,
                    coverUrl: coverUrl,
                    coverUrlFallback: coverUrlFallback,
                    contentUrl: contentUrl,
                    date: new Date(msg.timestamp).toLocaleDateString(),
                    timestamp: new Date(msg.timestamp).getTime(),
                    author: msg.author ? msg.author.nickname || msg.author.name : 'Unknown'
                });
            }
        });

        // Sort by oldest first (reversed order)
        return library.sort((a, b) => a.timestamp - b.timestamp);
    }
};
