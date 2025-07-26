// Portfolio Loader - Dynamic loading of portfolio items from Firebase
class PortfolioLoader {
    constructor() {
        this.portfolioData = {
            builds: [],
            textures: [],
            models: []
        };
        this.loadAllPortfolioData();
    }

    async loadAllPortfolioData() {
        try {
            // Load all portfolio types
            await Promise.all([
                this.loadBuilds(),
                this.loadTextures(),
                this.loadModels()
            ]);

            // Update the UI after loading
            this.updatePortfolioUI();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        }
    }

    async loadBuilds() {
        try {
            const snapshot = await firebase.firestore().collection('builds').get();
            this.portfolioData.builds = [];
            snapshot.forEach(doc => {
                this.portfolioData.builds.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    type: 'build'
                });
            });
        } catch (error) {
            console.error('Error loading builds:', error);
        }
    }

    async loadTextures() {
        try {
            const snapshot = await firebase.firestore().collection('textures').get();
            this.portfolioData.textures = [];
            snapshot.forEach(doc => {
                this.portfolioData.textures.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    type: 'texture'
                });
            });
        } catch (error) {
            console.error('Error loading textures:', error);
        }
    }

    async loadModels() {
        try {
            const snapshot = await firebase.firestore().collection('models').get();
            this.portfolioData.models = [];
            snapshot.forEach(doc => {
                this.portfolioData.models.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    type: 'model'
                });
            });
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    updatePortfolioUI() {
        // Update builds grid
        this.renderPortfolioGrid('buildsGrid', this.portfolioData.builds);
        
        // Update textures grid
        this.renderPortfolioGrid('texturesGrid', this.portfolioData.textures);
        
        // Update models grid
        this.renderPortfolioGrid('modelsGrid', this.portfolioData.models);

        // Update the global portfolioData for modal functionality
        this.updateGlobalPortfolioData();
    }

    renderPortfolioGrid(gridId, items) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No items found</p>
                </div>
            `;
            return;
        }

        const html = items.map(item => {
            // Supporta sia il vecchio campo image (stringa) che il nuovo images (array)
            const images = item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
            const firstImage = images.length > 0 ? images[0] : '';
            
            // Tronca la descrizione a 125 caratteri
            const description = item.description || '';
            const truncatedDescription = description.length > 125 ? description.substring(0, 125) + '...' : description;
            
            return `
            <div class="portfolio-item" data-tags="${item.tags.join(' ')}" onclick="openModal('${item.id}')">
                <div class="portfolio-img-container">
                    <img src="${firstImage}" alt="${item.title}">
                </div>
                <div class="portfolio-item-content">
                    <h5>${item.title}</h5>
                    <p>${truncatedDescription}</p>
                    <div>
                        ${item.tags.map(tag => {
                            const colorClasses = [
                                'tag-blue', 'tag-green', 'tag-red', 'tag-aqua-green',
                                'tag-magenta', 'tag-light-blue', 'tag-yellow',
                                'tag-orange', 'tag-brown', 'tag-gray',
                                'tag-white', 'tag-black'
                            ];
                            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
                            return `<span class="tag ${randomColorClass}">${tag}</span>`;
                        }).join(' ')}
                    </div>
                </div>
            </div>
            `;
        }).join('');

        grid.innerHTML = html;

        // Animate items
        setTimeout(() => {
            grid.querySelectorAll('.portfolio-item').forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 100);
            });
        }, 100);
    }

    updateGlobalPortfolioData() {
        // Create a combined portfolio data object for the modal system
        const combinedData = {};
        
        [...this.portfolioData.builds, ...this.portfolioData.textures, ...this.portfolioData.models].forEach(item => {
            combinedData[item.id] = {
                title: item.title,
                images: item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
                description: item.description,
                tags: item.tags,
                typeTags: item.typeTags || [] // Include typeTags field
            };
        });

        // Update the global portfolioData variable
        if (typeof window.portfolioData !== 'undefined') {
            Object.assign(window.portfolioData, combinedData);
        } else {
            window.portfolioData = combinedData;
        }
    }

    // Method to refresh a specific portfolio type
    async refreshPortfolioType(type) {
        switch(type) {
            case 'builds':
                await this.loadBuilds();
                this.renderPortfolioGrid('buildsGrid', this.portfolioData.builds);
                break;
            case 'textures':
                await this.loadTextures();
                this.renderPortfolioGrid('texturesGrid', this.portfolioData.textures);
                break;
            case 'models':
                await this.loadModels();
                this.renderPortfolioGrid('modelsGrid', this.portfolioData.models);
                break;
        }
        this.updateGlobalPortfolioData();
    }

    // Method to refresh all portfolio data
    async refreshAllPortfolio() {
        await this.loadAllPortfolioData();
    }

    // Method to be called when an item is updated/deleted from admin
    async handlePortfolioChange(collection) {
        console.log(`Portfolio change detected for ${collection}`);
        await this.refreshPortfolioType(collection);
    }

    // Getter methods for external access
    get builds() {
        return this.portfolioData.builds;
    }
    
    get textures() {
        return this.portfolioData.textures;
    }
    
    get models() {
        return this.portfolioData.models;
    }
}

// Initialize portfolio loader when Firebase is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            window.portfolioLoader = new PortfolioLoader();
        }
    }, 1000);
});
