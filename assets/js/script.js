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
    // Show selected section
    document.getElementById(pageId).classList.add('active');
    // Close mobile menu if open
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navbarCollapse).hide();
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Re-initialize animations for the new page
    setTimeout(() => {
        initAnimations();
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
    const sections = ['builds', 'textures', 'models'];
    sections.forEach(section => {
        const filterTags = document.querySelectorAll(`#${section} .filter-tag`);
        const searchBox = document.getElementById(`${section}Search`);
        const grid = document.getElementById(`${section}Grid`);
        
        // Filter tag functionality
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                // Update active tag
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                // Filter items
                filterItems(section, tag.dataset.filter, searchBox.value);
            });
        });
        
        // Search functionality
        if (searchBox) {
            searchBox.addEventListener('input', () => {
                const activeFilter = document.querySelector(`#${section} .filter-tag.active`).dataset.filter;
                filterItems(section, activeFilter, searchBox.value);
            });
        }
    });
}

function filterItems(section, filterType, searchTerm) {
    const items = document.querySelectorAll(`#${section}Grid .portfolio-item`);
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
const portfolioData = {
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
    const item = portfolioData[itemId];
    if (item) {
        document.getElementById('modalTitle').textContent = item.title;
        document.getElementById('modalItemTitle').textContent = item.title;
        document.getElementById('modalImage').src = item.image;
        document.getElementById('modalImage').alt = item.title;
        document.getElementById('modalDescription').textContent = item.description;
        const tagsContainer = document.getElementById('modalTags');
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
        const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
        modal.show();
        
        // Animate modal image
        setTimeout(() => {
            document.getElementById('modalImage').classList.add('animate');
        }, 100);
    }
}

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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    
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
});
