// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.style.overflow = 'auto';
    }, 1000);
});

// Scroll Progress
window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
});

// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('a, button, .portfolio-item, .filter-tag')) {
            cursor.style.transform = 'scale(2)';
            follower.style.transform = 'scale(1.5)';
            follower.style.width = '60px';
            follower.style.height = '60px';
        }
    });
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('a, button, .portfolio-item, .filter-tag')) {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
            follower.style.width = '40px';
            follower.style.height = '40px';
        }
    });
}

// Page navigation
function showPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section (check if it exists first)
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Handle My Services section visibility
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        if (pageId === 'home') {
            // Show services section only on home page
            servicesSection.style.display = 'block';
        } else {
            // Hide services section on all other pages
            servicesSection.style.display = 'none';
        }
    }
    
    // Close mobile menu if open
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navbarCollapse).hide();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Re-initialize animations for the new page
    setTimeout(() => {
        if (typeof initAnimations === 'function') {
            initAnimations();
        }
    }, 100);
}

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

// Filter functionality
function initializeFilters() {
    const sections = ['builds', 'textures', 'models', 'shop'];
    sections.forEach(section => {
        const filterTags = document.querySelectorAll(`#${section} .filter-tag`);
        const searchBox = document.getElementById(`${section}Search`);
        const grid = document.getElementById(`${section}Grid`);
        
        // Filter tag functionality (skip for shop - no category filters)
        if (section !== 'shop') {
            filterTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    // Update active tag
                    filterTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    // Filter items
                    filterItems(section, tag.dataset.filter, searchBox.value);
                });
            });
        }
        
        // Search functionality
        if (searchBox) {
            searchBox.addEventListener('input', () => {
                if (section === 'shop') {
                    // Shop only has search, no category filters
                    filterItems(section, 'all', searchBox.value);
                } else {
                    const activeFilter = document.querySelector(`#${section} .filter-tag.active`).dataset.filter;
                    filterItems(section, activeFilter, searchBox.value);
                }
            });
        }
    });
}

function filterItems(section, filterType, searchTerm) {
    const itemSelector = section === 'shop' ? '.shop-item' : '.portfolio-item';
    const items = document.querySelectorAll(`#${section}Grid ${itemSelector}`);
    items.forEach(item => {
        const tags = item.dataset.tags.toLowerCase();
        const title = item.querySelector('h5').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        const matchesFilter = filterType === 'all' || tags.includes(filterType);
        const matchesSearch = searchTerm === '' || 
            title.includes(searchTerm.toLowerCase()) || 
            description.includes(searchTerm.toLowerCase()) ||
            tags.includes(searchTerm.toLowerCase());
        if (matchesFilter && matchesSearch) {
            item.style.display = 'block';
            setTimeout(() => {
                item.classList.add('fade-in');
            }, 50);
        } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
}

// Modal functionality
window.portfolioData = {
    build1: {
        title: 'Modern Glass House',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'A sleek contemporary design featuring clean lines and panoramic windows. This build showcases modern architectural principles with sustainable materials and energy-efficient systems. The open-plan layout creates a seamless flow between indoor and outdoor spaces. The extensive use of glass provides abundant natural light while maintaining energy efficiency through advanced glazing technology.',
        tags: ['Modern', 'Architecture', 'Sustainable', 'Luxury']
    },
    build2: {
        title: 'Medieval Fortress',
        image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'An imposing castle with detailed stonework and defensive structures. This fortress features authentic medieval architecture with working portcullis, defensive towers, and a great hall. Every stone has been carefully placed to create historical accuracy. The interior includes period-accurate furnishings and decorations, creating an immersive historical experience.',
        tags: ['Medieval', 'Fantasy', 'Historical', 'Castle']
    },
    build3: {
        title: 'Enchanted Tower',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'A mystical tower with intricate magical details and floating elements. This fantasy structure incorporates glowing crystals, floating platforms, and ethereal lighting effects that create an otherworldly atmosphere. The design includes multiple levels connected by magical energy bridges, with each floor featuring unique enchantments and environmental effects.',
        tags: ['Fantasy', 'Architecture', 'Magical', 'Tower']
    },
    build4: {
        title: 'Modern Landscape',
        image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Contemporary landscape design with geometric patterns, water features, and sustainable planting. This outdoor space combines modern aesthetics with eco-friendly principles, featuring native drought-resistant plants, smart irrigation systems, and recycled materials. The design creates multiple zones for relaxation, entertainment, and contemplation.',
        tags: ['Landscape', 'Modern', 'Sustainable', 'Outdoor']
    },
    texture1: {
        title: 'Ancient Stone Wall',
        image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Weathered stone texture with realistic wear patterns, moss details, and authentic aging. This high-resolution texture features natural discoloration, organic moss growth, and subtle cracks that add character to any medieval or ancient build. The texture includes normal and specular maps for advanced rendering.',
        tags: ['Stone', 'Weathered', 'Natural', 'Wall']
    },
    texture2: {
        title: 'Oak Wood Planks',
        image: 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Rich oak wood texture with natural grain patterns, knots, and realistic lighting effects. This texture captures the natural beauty of oak with authentic wood grain, color variations, and subtle imperfections that bring warmth to any design. Includes seamless tiling and PBR material maps.',
        tags: ['Wood', 'Oak', 'Natural', 'Planks']
    },
    texture3: {
        title: 'Brushed Steel',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Industrial brushed steel texture with authentic surface reflections and subtle scratches. This metallic texture features realistic brush strokes, wear patterns, and proper light reflection properties perfect for modern industrial designs. Includes metallic and roughness maps for physically-based rendering.',
        tags: ['Metal', 'Industrial', 'Modern', 'Steel']
    },
    texture4: {
        title: 'Linen Fabric',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Natural linen texture with realistic folds, lighting, and subtle imperfections. This high-resolution fabric texture features authentic weave patterns, natural color variations, and realistic drapery effects. Perfect for upholstery, clothing, or interior design applications.',
        tags: ['Fabric', 'Natural', 'Linen', 'Textile']
    },
    model1: {
        title: 'Modern Office Chair',
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Ergonomic office chair with detailed materials, realistic proportions, and adjustable features. This 3D model features accurate geometry, high-quality textures, and proper scale for architectural visualization or game development. Includes multiple material variations and adjustable components.',
        tags: ['Furniture', 'Modern', 'Ergonomic', 'Chair']
    },
    model2: {
        title: 'Sports Car',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'High-detail sports car model with accurate geometry, detailed interior, and realistic materials. This vehicle model includes fully modeled engine bay, detailed cockpit, and realistic materials with proper UV mapping. Optimized for real-time rendering with LOD models included.',
        tags: ['Vehicles', 'Sports', 'Detailed', 'Car']
    },
    model3: {
        title: 'Medieval Sword',
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Intricately designed medieval sword with ornate handle, sharp blade, and historical accuracy. This weapon model features historically accurate proportions, detailed engravings, and realistic materials perfect for fantasy projects. Includes multiple texture sets for different metal finishes.',
        tags: ['Props', 'Medieval', 'Weapon', 'Sword']
    },
    model4: {
        title: 'Fantasy Warrior',
        image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Highly detailed fantasy warrior character with custom armor, weapons, and realistic textures. This character model features a fully rigged skeleton, facial morph targets, and multiple armor configurations. Includes PBR textures and multiple animation sets for game integration.',
        tags: ['Characters', 'Fantasy', 'Detailed', 'Warrior']
    },
    review1: {
        title: 'Modern Villa Build',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Custom modern villa build commissioned by John Doe. This luxury residence features contemporary architecture with clean lines, floor-to-ceiling windows, and seamless indoor-outdoor living spaces. The project included detailed interior design and custom landscaping.',
        tags: ['Commission', 'Modern', 'Villa', 'Residential']
    },
    review2: {
        title: 'Custom Texture Pack',
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Comprehensive texture pack created for Sarah Miller\'s game project. Includes 50+ high-resolution textures covering stone, wood, metal, and fabric materials with consistent lighting and quality. All textures include PBR maps and seamless tiling.',
        tags: ['Commission', 'Textures', 'Pack', 'Game']
    },
    review3: {
        title: 'Furniture Model Set',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Complete furniture collection modeled for Robert Johnson. Includes chairs, tables, sofas, and accessories with detailed materials and optimized geometry for real-time rendering. All models include LOD versions and PBR textures.',
        tags: ['Commission', 'Furniture', 'Set', 'Interior']
    },
    review4: {
        title: 'Medieval Castle',
        image: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description: 'Historically accurate medieval castle built for Anna Lee. Features authentic defensive architecture, detailed stonework, and period-appropriate interior spaces. The castle includes multiple towers, a great hall, and functional defenses.',
        tags: ['Commission', 'Medieval', 'Castle', 'Historical']
    }
};

function openModal(itemId) {
    const item = window.portfolioData[itemId];
    if (!item) {
        console.error('Portfolio item not found:', itemId);
        return;
    }

    // Check if modal elements exist
    const modalTitle = document.getElementById('modalTitle');
    const modalItemTitle = document.getElementById('modalItemTitle');
    const modalDescription = document.getElementById('modalDescription');
    const tagsContainer = document.getElementById('modalTags');
    const imageContainerDiv = document.getElementById('modalImageContainer');

    if (!modalTitle || !modalItemTitle || !modalDescription || !tagsContainer || !imageContainerDiv) {
        console.error('Modal elements not found');
        return;
    }

    // Clear image container
    imageContainerDiv.innerHTML = '';

    // Set text content
    modalTitle.textContent = item.title;
    modalItemTitle.textContent = item.title;
    modalDescription.textContent = item.description;

    const colorClasses = [
        'tag-blue', 'tag-green', 'tag-red', 'tag-aqua-green',
        'tag-magenta', 'tag-light-blue', 'tag-yellow',
        'tag-orange', 'tag-brown', 'tag-gray',
        'tag-white', 'tag-black'
    ];

    tagsContainer.innerHTML = item.tags.map(tag => {
        const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
        return `<span class="tag ${randomColorClass}">${tag}</span>`;
    }).join(' ');

    // Add type tags if they exist
    if (item.typeTags && item.typeTags.length > 0) {
        const typeTags = document.getElementById('modalTypeTags');
        if (typeTags) {
            typeTags.innerHTML = item.typeTags.map(tag => {
                const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
                return `<span class="type-tag ${randomColorClass}">${tag}</span>`;
            }).join(' ');
            typeTags.style.display = 'block';
        }
    } else {
        const typeTags = document.getElementById('modalTypeTags');
        if (typeTags) {
            typeTags.style.display = 'none';
        }
    }

    // Carousel delle immagini
    const images = item.images && Array.isArray(item.images) ? item.images : [item.images || ''];
    let carouselHtml = '';
    const carouselId = `modalCarousel_${itemId}_${Date.now()}`;

    if (images.length > 1) {
        carouselHtml = `
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
                ${images.map((_, idx) => `
                    <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${idx}" 
                            class="${idx === 0 ? 'active' : ''}" aria-current="${idx === 0 ? 'true' : 'false'}" 
                            aria-label="Slide ${idx + 1}"></button>
                `).join('')}
            </div>
            <div class="carousel-inner">
                ${images.map((img, idx) => `
                    <div class="carousel-item${idx === 0 ? ' active' : ''}">
                        <img src="${img}" class="d-block w-100" alt="${item.title}" style="max-height: 400px; object-fit: contain;">
                    </div>
                `).join('')}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>`;
    } else if (images.length === 1 && images[0]) {
        carouselHtml = `<img src="${images[0]}" alt="${item.title}" class="img-fluid rounded" style="max-height: 400px; width: 100%; object-fit: contain;">`;
    } else {
        carouselHtml = `<img src="" alt="No image" class="img-fluid rounded"><div class="text-muted text-center mt-2">Nessuna immagine disponibile</div>`;
    }

    // Insert new content
    imageContainerDiv.innerHTML = carouselHtml;
    if (images.length > 1) {
        const newCarousel = document.getElementById(carouselId);
        if (newCarousel) {
            new bootstrap.Carousel(newCarousel);
        }
    }

    const portfolioModal = document.getElementById('portfolioModal');
    if (portfolioModal) {
        const modal = new bootstrap.Modal(portfolioModal);
        modal.show();
    }
}

// Clear modal content when it's closed
document.addEventListener('DOMContentLoaded', function() {
    const portfolioModal = document.getElementById('portfolioModal');
    if (portfolioModal) {
        portfolioModal.addEventListener('hidden.bs.modal', function () {
            // Clear modal content to prevent caching
            const imageContainerDiv = document.getElementById('modalImageContainer');
            if (imageContainerDiv) imageContainerDiv.innerHTML = '';
            // Clear text content
            const modalTitle = document.getElementById('modalTitle');
            const modalItemTitle = document.getElementById('modalItemTitle');
            const modalDescription = document.getElementById('modalDescription');
            const modalTags = document.getElementById('modalTags');
            const modalTypeTags = document.getElementById('modalTypeTags');
            if (modalTitle) modalTitle.textContent = '';
            if (modalItemTitle) modalItemTitle.textContent = '';
            if (modalDescription) modalDescription.textContent = '';
            if (modalTags) modalTags.innerHTML = '';
            if (modalTypeTags) {
                modalTypeTags.innerHTML = '';
                modalTypeTags.style.display = 'none';
            }
        });
    }
});

// Back to top button
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize animations
function initAnimations() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // Animate hero stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate');
        }, 300 * index);
    });
    
    // Animate portfolio items
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate');
        }, 100 * index);
    });
    
    // Animate section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('animate');
    });
    const sectionTitles2 = document.querySelectorAll('.section-title2');
    sectionTitles2.forEach(title2 => {
        title2.classList.add('animate');
    });
    // Animate filter controls
    const filterControls = document.querySelectorAll('.filter-controls');
    filterControls.forEach(control => {
        control.classList.add('animate');
    });
    
    // Animate review cards
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
        }, 100 * index);
    });
    
    // Animate contact items
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate');
        }, 100 * index);
    });
}

// Automatic Translation System
function initializeLanguage() {
    const currentLanguage = localStorage.getItem('language') || 'en';
    const languageOptions = document.querySelectorAll('.language-option');
    const currentLanguageSpan = document.getElementById('currentLanguage');
    
    // Language names mapping
    const languageNames = {
        en: 'English',
        it: 'Italiano'
    };

    // Translation dictionary for automatic translation
    const translations = {
        // Navigation and main sections
        'Portfolio': { it: 'Portfolio' },
        'Builds': { it: 'Costruzioni' },
        'Textures': { it: 'Texture' },
        'Models': { it: 'Modelli' },
        'Reviews': { it: 'Recensioni' },
        'Contacts': { it: 'Contatti' },
        'Contact': { it: 'Contatto' },
        'Home': { it: 'Casa' },
        
        // Services section
        'My Services': { it: 'I Miei Servizi' },
        '3D Modeling': { it: 'Modellazione 3D' },
        'Texture Creation': { it: 'Creazione Texture' },
        'Environment Design': { it: 'Design Ambientale' },
        'Professional 3D modeling services for characters, props, and environments with high-quality textures and optimized topology.': {
            it: 'Servizi professionali di modellazione 3D per personaggi, oggetti e ambienti con texture di alta qualità e topologia ottimizzata.'
        },
        'Custom PBR textures and material creation for any surface with realistic details and seamless tiling.': {
            it: 'Texture PBR personalizzate e creazione di materiali per qualsiasi superficie con dettagli realistici e ripetizione perfetta.'
        },
        'Complete environment builds for games and virtual worlds with optimized assets and lighting setups.': {
            it: 'Costruzioni complete di ambienti per giochi e mondi virtuali con asset ottimizzati e configurazioni di illuminazione.'
        },
        
        // Portfolio sections
        'Builds Portfolio': { it: 'Portfolio Costruzioni' },
        'Textures Portfolio': { it: 'Portfolio Texture' },
        'Models Portfolio': { it: 'Portfolio Modelli' },
        'Client Reviews': { it: 'Recensioni Clienti' },
        
        // Filter tags
        'All': { it: 'Tutto' },
        'Modern': { it: 'Moderno' },
        'Medieval': { it: 'Medievale' },
        'Fantasy': { it: 'Fantasy' },
        'Architecture': { it: 'Architettura' },
        'Landscape': { it: 'Paesaggio' },
        'Stone': { it: 'Pietra' },
        'Wood': { it: 'Legno' },
        'Metal': { it: 'Metallo' },
        'Fabric': { it: 'Tessuto' },
        'Nature': { it: 'Natura' },
        'Furniture': { it: 'Mobili' },
        'Vehicles': { it: 'Veicoli' },
        'Characters': { it: 'Personaggi' },
        'Props': { it: 'Oggetti' },
        
        // Contact section
        'Get In Touch': { it: 'Mettiti in Contatto' },
        'Email': { it: 'Email' },
        'Discord': { it: 'Discord' },
        'Fiverr': { it: 'Fiverr' },
        'Behance': { it: 'Behance' },
        'Website': { it: 'Sito Web' },
        
        // Stats and labels
        'Projects': { it: 'Progetti' },
        'Satisfaction': { it: 'Soddisfazione' },
        'Years Experience': { it: 'Anni di Esperienza' },
        
        // Loading and search
        'Loading builds...': { it: 'Caricamento costruzioni...' },
        'Loading textures...': { it: 'Caricamento texture...' },
        'Loading models...': { it: 'Caricamento modelli...' },
        'Loading reviews...': { it: 'Caricamento recensioni...' },
        'Search builds...': { it: 'Cerca costruzioni...' },
        'Search textures...': { it: 'Cerca texture...' },
        'Search models...': { it: 'Cerca modelli...' },
        
        // Hero section
        'Transforming ideas into immersive experiences through stunning builds, detailed textures, and professional models': {
            it: 'Trasformo idee in esperienze immersive attraverso costruzioni spettacolari, texture dettagliate e modelli professionali'
        },
        'Explore Portfolio': { it: 'Esplora Portfolio' },
        
        // Modal
        'Portfolio Item': { it: 'Elemento Portfolio' },
        'Title': { it: 'Titolo' },
        'Description goes here.': { it: 'La descrizione va qui.' },
        
        // Footer
        'All rights reserved': { it: 'Tutti i diritti riservati' }
    };

    // Set initial language
    updateLanguage(currentLanguage);
    
    // Add event listeners to language options
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            updateLanguage(lang);
            localStorage.setItem('language', lang);
        });
    });

    function updateLanguage(lang) {
        // Update dropdown button text
        if (currentLanguageSpan) {
            currentLanguageSpan.textContent = languageNames[lang];
        }

        // First, handle elements with explicit translation attributes
        document.querySelectorAll('.translatable').forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                element.textContent = translation;
                return;
            }
        });

        // Automatic translation for all text elements
        if (lang !== 'en') {
            translatePageContent(lang);
        } else {
            // If switching back to English, reload the page or restore original content
            restoreOriginalContent();
        }

        // Update placeholders
        updatePlaceholders(lang);

        // Update active state in dropdown
        languageOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            }
        });
        
        // Update coffee button text for new language
        if (window.shopManager) {
            shopManager.updateCoffeeButtonText();
        }
    }

    function translatePageContent(targetLang) {
        // Store original content if not already stored
        if (!window.originalContent) {
            window.originalContent = new Map();
        }

        // Elements to translate automatically
        const elementsToTranslate = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not(.visually-hidden), .filter-tag, .stat-label, .footer-link, button:not(.btn-close):not(.navbar-toggler), .modal-title');
        
        elementsToTranslate.forEach(element => {
            // Skip if element has explicit translation attributes or is already processed
            if (element.hasAttribute('data-en') || element.classList.contains('language-processed')) {
                return;
            }

            // Skip elements with only icons or empty content
            const textContent = element.textContent.trim();
            if (!textContent || textContent.length < 2) {
                return;
            }

            // Store original content
            if (!window.originalContent.has(element)) {
                window.originalContent.set(element, textContent);
            }

            // Try to find translation in dictionary
            const translation = translations[textContent];
            if (translation && translation[targetLang]) {
                element.textContent = translation[targetLang];
                element.classList.add('language-processed');
            }
        });

        // Handle input placeholders
        document.querySelectorAll('input[placeholder]').forEach(input => {
            const originalPlaceholder = input.getAttribute('placeholder');
            if (!input.hasAttribute('data-original-placeholder')) {
                input.setAttribute('data-original-placeholder', originalPlaceholder);
            }
            
            const translation = translations[originalPlaceholder];
            if (translation && translation[targetLang]) {
                input.setAttribute('placeholder', translation[targetLang]);
            }
        });
    }

    function restoreOriginalContent() {
        if (window.originalContent) {
            window.originalContent.forEach((originalText, element) => {
                if (element && element.parentNode) {
                    element.textContent = originalText;
                    element.classList.remove('language-processed');
                }
            });
        }

        // Restore original placeholders
        document.querySelectorAll('input[data-original-placeholder]').forEach(input => {
            const originalPlaceholder = input.getAttribute('data-original-placeholder');
            input.setAttribute('placeholder', originalPlaceholder);
        });
    }

    function updatePlaceholders(lang) {
        // Handle elements with explicit placeholder attributes
        document.querySelectorAll(`[data-${lang}-placeholder]`).forEach(input => {
            const placeholder = input.getAttribute(`data-${lang}-placeholder`);
            if (placeholder) {
                input.placeholder = placeholder;
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeLanguage();
    
    // Initialize services section visibility (show on home page by default)
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.style.display = 'block';
    }
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar-custom');
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = body.classList.contains('light-mode') ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)';
        } else {
            navbar.style.backgroundColor = body.classList.contains('light-mode') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 26, 26, 0.95)';
        }
    });
    
    // Initialize animations
    initAnimations();
    
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#8b5cf6" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#8b5cf6",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            }
        });
    }
    
    // Prevent page refresh on dropdown clicks
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
    
    // Initialize shop settings
    if (typeof firebase !== 'undefined') {
        shopManager = new ShopSettingsManager();
    } else {
        // Wait for Firebase to load
        setTimeout(() => {
            shopManager = new ShopSettingsManager();
        }, 1000);
    }
});

// Shop Settings Manager - Single database call
class ShopSettingsManager {
    constructor() {
        this.settings = null;
        this.initializeShop();
    }

    async initializeShop() {
        try {
            await this.loadSettings();
            this.updateAllShopElements();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing shop:', error);
        }
    }

    async loadSettings() {
        try {
            const doc = await firebase.firestore().collection('settings').doc('site').get();
            if (doc.exists) {
                this.settings = doc.data();
            } else {
                this.settings = { 
                    coffeeUrl: 'https://www.buymeacoffee.com/matthopes', 
                    coffeeButtonText: 'Buy me a coffee', 
                    coffeeButtonTextIt: 'Offrimi un caffè' 
                };
            }
        } catch (error) {
            console.error('Error loading coffee settings:', error);
            this.settings = { 
                coffeeUrl: 'https://www.buymeacoffee.com/matthopes', 
                coffeeButtonText: 'Buy me a coffee', 
                coffeeButtonTextIt: 'Offrimi un caffè' 
            };
        }
    }

    updateAllShopElements() {
        if (!this.settings) return;

        const hasShopUrl = this.settings.shopUrl && this.settings.shopUrl.trim();
        
        // Update coffee button with dynamic settings
        const coffeeButton = document.getElementById('coffeeButton');
        if (coffeeButton && this.settings) {
            // Update URL if provided
            if (this.settings.coffeeUrl) {
                coffeeButton.href = this.settings.coffeeUrl;
            }
            
            // Update button text based on current language
            this.updateCoffeeButtonText();
        }
        
        // Update contact section shop item
        const shopContactItem = document.getElementById('shopContactItem');
        const shopContactLink = document.getElementById('shopContactLink');
        if (shopContactItem && shopContactLink) {
            if (hasShopUrl) {
                shopContactLink.href = this.settings.shopUrl;
                shopContactItem.style.display = 'block';
            } else {
                shopContactItem.style.display = 'none';
            }
        }

        // Update footer shop link
        const shopFooterLink = document.getElementById('shopFooterLink');
        if (shopFooterLink) {
            if (hasShopUrl) {
                shopFooterLink.href = this.settings.shopUrl;
                shopFooterLink.style.display = 'inline';
            } else {
                shopFooterLink.style.display = 'none';
            }
        }

        // Update coffee button text based on current language
        this.updateCoffeeButtonText();
    }

    updateCoffeeButtonText() {
        if (!this.settings) return;

        const currentLanguage = localStorage.getItem('language') || 'en';
        
        // Update coffee button text
        const coffeeButtonText = document.querySelector('#coffeeButton .translatable');
        if (coffeeButtonText) {
            coffeeButtonText.setAttribute('data-en', this.settings.coffeeButtonText || 'Buy me a coffee');
            coffeeButtonText.setAttribute('data-it', this.settings.coffeeButtonTextIt || 'Offrimi un caffè');
            const translation = coffeeButtonText.getAttribute(`data-${currentLanguage}`);
            if (translation) {
                coffeeButtonText.textContent = translation;
            }
        }
    }

    setupEventListeners() {
        // Listen for settings updates from admin
        window.addEventListener('shopSettingsUpdated', (event) => {
            this.settings = event.detail;
            this.updateAllCoffeeElements();
        });

        // Listen for localStorage changes (from admin in another tab)
        window.addEventListener('storage', (event) => {
            if (event.key === 'coffeeSettings') {
                try {
                    this.settings = JSON.parse(event.newValue);
                    this.updateAllCoffeeElements();
                } catch (error) {
                    console.error('Error parsing coffee settings from localStorage:', error);
                }
            }
        });
    }

    updateAllCoffeeElements() {
        // Update coffee button URL
        const coffeeButton = document.getElementById('coffeeButton');
        if (coffeeButton && this.settings && this.settings.coffeeUrl) {
            coffeeButton.href = this.settings.coffeeUrl;
        }
        
        // Update text based on current language
        this.updateCoffeeButtonText();
    }

    // Public method to refresh settings
    async refreshSettings() {
        await this.loadSettings();
        this.updateAllCoffeeElements();
    }
}

// Coffee button is static - minimal shop manager needed
let shopManager;

// Function to redirect to shop item
function redirectToShopItem(customLink) {
    if (customLink && customLink !== '#') {
        window.open(customLink, '_blank');
    } else {
        console.warn('No custom link provided for this shop item');
    }
}

// Function to show shop item details in modal
function showShopItemDetails(itemId) {
    // Get item data from portfolio loader
    if (!window.portfolioLoader || !window.portfolioLoader.shop) {
        console.error('Portfolio data not loaded');
        return;
    }
    
    const item = window.portfolioLoader.shop.find(shopItem => shopItem.id === itemId);
    if (!item) {
        console.error('Shop item not found:', itemId);
        return;
    }
    
    // Populate modal with item data
    populateShopDetailsModal(item);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('shopDetailsModal'));
    modal.show();
}

// Function to populate shop details modal
function populateShopDetailsModal(item) {
    // Handle images
    const images = item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
    const mainImage = document.getElementById('shopDetailMainImage');
    const thumbnailsContainer = document.getElementById('shopDetailThumbnails');
    
    if (images.length > 0) {
        mainImage.src = images[0];
        mainImage.alt = item.title;
        
        // Create thumbnails
        thumbnailsContainer.innerHTML = '';
        images.forEach((imageUrl, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imageUrl;
            thumbnail.alt = `${item.title} - Image ${index + 1}`;
            thumbnail.className = 'img-thumbnail shop-thumbnail';
            thumbnail.style.cssText = 'width: 80px; height: 60px; object-fit: cover; cursor: pointer;';
            thumbnail.onclick = () => {
                mainImage.src = imageUrl;
                // Remove active class from all thumbnails
                thumbnailsContainer.querySelectorAll('.shop-thumbnail').forEach(thumb => {
                    thumb.classList.remove('border-purple');
                });
                // Add active class to clicked thumbnail
                thumbnail.classList.add('border-purple');
            };
            
            // Make first thumbnail active
            if (index === 0) {
                thumbnail.classList.add('border-purple');
            }
            
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else {
        mainImage.src = 'https://via.placeholder.com/400x300?text=No+Image';
        thumbnailsContainer.innerHTML = '';
    }
    
    // Populate text content
    document.getElementById('shopDetailTitle').textContent = item.title || 'Untitled Product';
    document.getElementById('shopDetailPrice').textContent = item.price || 'Price on request';
    document.getElementById('shopDetailDescription').textContent = item.description || 'No description available';
    
    // Populate tags
    const tagsContainer = document.getElementById('shopDetailTags');
    if (item.tags && item.tags.length > 0) {
        tagsContainer.innerHTML = item.tags.map(tag => {
            const colorClasses = [
                'bg-primary', 'bg-success', 'bg-danger', 'bg-info',
                'bg-warning text-dark', 'bg-secondary', 'bg-dark'
            ];
            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
            return `<span class="badge ${randomColorClass} me-1 mb-1">${tag}</span>`;
        }).join('');
    } else {
        tagsContainer.innerHTML = '<span class="text-muted">No tags</span>';
    }
    
    // Populate type tags if available
    const typeTagsContainer = document.getElementById('shopDetailTypeTagsContainer');
    const typeTags = document.getElementById('shopDetailTypeTags');
    if (item.typeTags && item.typeTags.length > 0) {
        typeTagsContainer.style.display = 'block';
        typeTags.innerHTML = item.typeTags.map(tag => {
            const colorClasses = [
                'bg-purple', 'bg-gradient-purple', 'bg-info', 'bg-success'
            ];
            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
            return `<span class="badge ${randomColorClass} me-1 mb-1">${tag}</span>`;
        }).join('');
    } else {
        typeTagsContainer.style.display = 'none';
    }
    
    // Setup buy button
    const buyButton = document.getElementById('shopDetailBuyButton');
    buyButton.onclick = () => {
        if (item.customLink && item.customLink !== '#') {
            window.open(item.customLink, '_blank');
        } else {
            alert('Purchase link not available for this product.');
        }
    };
}
