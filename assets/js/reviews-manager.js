// Reviews Manager - Firebase Integration for GitHub Pages
class ReviewsManager {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.auth = null;
        this.reviewsCollection = null;
        this.initFirebase();
    }

    async initFirebase() {
        try {
            // Wait for Firebase to load
            await this.waitForFirebase();
            
            // Use existing Firebase app or initialize if needed
            let app;
            if (firebase.apps.length > 0) {
                app = firebase.apps[0];
            } else {
                app = firebase.initializeApp(window.firebaseConfig);
            }
            
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.reviewsCollection = this.db.collection('reviews');

            // Only set up auth state listener if not on admin page
            // Admin page has its own auth state management
            if (!window.location.pathname.includes('admin.html')) {
                this.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.updateAdminUI();
                });
            }

            // Load reviews on init
            this.loadReviews();
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.showNotification('Errore nell\'inizializzazione Firebase', 'error');
        }
    }

    waitForFirebase() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 50;
            let attempts = 0;
            
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkFirebase, 100);
                } else {
                    reject(new Error('Firebase failed to load'));
                }
            };
            
            checkFirebase();
        });
    }

    // Authentication
    async login(email, password) {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            this.showNotification('Login effettuato con successo!', 'success');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Errore nel login: ' + error.message, 'error');
            return false;
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            this.showNotification('Logout successful', 'success');
            // Redirect to home page after logout
            showPage('home');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Reviews CRUD
    async addReview(reviewData) {
        try {
            const docRef = await this.reviewsCollection.add({
                ...reviewData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                visible: true
            });
            this.showNotification('Recensione aggiunta con successo!', 'success');
            this.loadReviews(); // Reload reviews
            return docRef.id;
        } catch (error) {
            console.error('Error adding review:', error);
            this.showNotification('Errore nell\'aggiungere la recensione', 'error');
            throw error;
        }
    }

    async loadReviews() {
        try {
            const querySnapshot = await this.reviewsCollection.orderBy('createdAt', 'desc').get();
            const reviews = [];
            
            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displayReviews(reviews);
            this.displayAdminReviews(reviews);
            return reviews;
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.showNotification('Errore nel caricare le recensioni', 'error');
            return [];
        }
    }

    // Add this method for admin compatibility
    async loadAdminReviews() {
        console.log('🔄 Loading admin reviews...');
        return await this.loadReviews();
    }

    async deleteReview(reviewId) {
        try {
            await this.reviewsCollection.doc(reviewId).delete();
            this.showNotification('Recensione eliminata', 'success');
            this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            this.showNotification('Errore nell\'eliminare la recensione', 'error');
        }
    }

    async toggleReviewVisibility(reviewId, currentVisibility) {
        try {
            await this.reviewsCollection.doc(reviewId).update({
                visible: !currentVisibility
            });
            this.showNotification('Visibilità aggiornata', 'success');
            this.loadReviews();
        } catch (error) {
            console.error('Error updating visibility:', error);
            this.showNotification('Errore nell\'aggiornare la visibilità', 'error');
        }
    }

    // UI Methods
    displayReviews(reviews) {
        const reviewsContainer = document.getElementById('reviews-container');
        if (!reviewsContainer) return;

        const visibleReviews = reviews.filter(review => review.visible);
        
        if (visibleReviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Nessuna recensione disponibile al momento.</p>
                </div>
            `;
            return;
        }

        reviewsContainer.innerHTML = visibleReviews.map(review => `
            <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
                <div class="review-card">
                    <div class="review-header">
                        <h5 class="review-name">${this.escapeHtml(review.clientName)}</h5>
                        <div class="review-rating">
                            ${this.generateStars(review.rating)}
                        </div>
                    </div>
                    <div class="review-tags mb-3">
                        <span class="review-tag nationality-tag">${review.nationality || '🌍 Unknown'}</span>
                        <span class="review-tag service-tag">🛠️ ${review.service || 'General Service'}</span>
                    </div>
                    <p class="review-comment">"${this.escapeHtml(review.comment)}"</p>
                    <small class="review-date">${this.formatDate(review.createdAt)}</small>
                </div>
            </div>
        `).join('');
    }

    displayAdminReviews(reviews) {
        const adminReviewsList = document.getElementById('admin-reviews-list');
        if (!adminReviewsList || !this.currentUser) return;

        adminReviewsList.innerHTML = reviews.map(review => `
            <div class="admin-review-item ${!review.visible ? 'hidden-review' : ''}">
                <div class="review-info">
                    <h6>${this.escapeHtml(review.clientName)} - ${this.generateStars(review.rating)}</h6>
                    <div class="mb-2">
                        <span class="badge bg-primary me-2">${review.nationality || '🌍 Unknown'}</span>
                        <span class="badge bg-secondary">🛠️ ${review.service || 'General Service'}</span>
                    </div>
                    <p>${this.escapeHtml(review.comment)}</p>
                    <small>${this.formatDate(review.createdAt)}</small>
                </div>
                <div class="review-actions">
                    <button class="btn btn-sm btn-outline-warning" onclick="reviewsManager.toggleReviewVisibility('${review.id}', ${review.visible})">
                        ${review.visible ? 'Nascondi' : 'Mostra'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="reviewsManager.deleteReview('${review.id}')">
                        Elimina
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateAdminUI() {
        const loginStatus = document.getElementById('login-status');

        if (this.currentUser) {
            // User is logged in - show admin dashboard
            if (loginStatus) loginStatus.textContent = `Logged in as: ${this.currentUser.email}`;
            
            // Check if we're on the admin page specifically
            if (window.location.pathname.includes('admin.html')) {
                this.loadReviews();
            } else if (typeof showPage === 'function' && document.getElementById('admin')) {
                // Hide login page and show admin dashboard (only for index.html with admin section)
                showPage('admin');
                this.loadReviews();
            } else {
                // Just load reviews without page navigation
                this.loadReviews();
            }
        } else {
            // User is not logged in
            if (loginStatus) loginStatus.textContent = '';
            
            // Check if we're on login or admin page, redirect accordingly
            if (typeof showPage === 'function') {
                const currentPage = document.querySelector('.page-section.active');
                if (currentPage && (currentPage.id === 'admin' || currentPage.id === 'login')) {
                    // If we were on admin page and logged out, go to login
                    if (currentPage.id === 'admin') {
                        showPage('login');
                    }
                }
            }
        }
    }

    // Method specifically for admin page
    loadAdminReviews() {
        this.loadReviews();
    }

    // Utility methods
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }

    formatDate(timestamp) {
        if (!timestamp) return '';
        let date;
        if (timestamp && timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date();
        }
        return date.toLocaleDateString('it-IT');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize reviews manager when DOM is loaded
let reviewsManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize reviews manager
    reviewsManager = new ReviewsManager();
    
    // Make it globally available
    window.reviewsManager = reviewsManager;

    // Admin login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            await reviewsManager.login(email, password);
        });
    }

    // Add review form
    const addReviewForm = document.getElementById('add-review-form');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const reviewData = {
                clientName: formData.get('clientName'),
                rating: parseFloat(formData.get('rating')),
                comment: formData.get('comment'),
                nationality: formData.get('nationality'),
                service: formData.get('service')
            };
            
            await reviewsManager.addReview(reviewData);
            e.target.reset();
        });
    }
});
