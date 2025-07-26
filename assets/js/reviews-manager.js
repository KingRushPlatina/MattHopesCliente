// Reviews Manager - Firebase Integration for GitHub Pages
class ReviewsManager {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.auth = null;
        this.reviewsCollection = null;
        this.reviewComments = {}; // Store full and truncated comments for toggling
        this.currentReviews = {}; // Store current reviews for easy access during editing
        this.allReviews = []; // Store all reviews for filtering
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
            // Use custom date if provided, otherwise use server timestamp
            const dataToSave = {
                ...reviewData,
                visible: true
            };
            
            if (reviewData.reviewDate) {
                // Convert date string to Firestore timestamp
                const customDate = new Date(reviewData.reviewDate);
                dataToSave.createdAt = firebase.firestore.Timestamp.fromDate(customDate);
            } else {
                // Fallback to server timestamp if no date provided
                dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            
            const docRef = await this.reviewsCollection.add(dataToSave);
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
        if (!confirm('Sei sicuro di voler eliminare questa recensione?')) {
            return;
        }
        
        try {
            await this.reviewsCollection.doc(reviewId).delete();
            this.showNotification('Recensione eliminata', 'success');
            this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            this.showNotification('Errore nell\'eliminare la recensione', 'error');
        }
    }

    async updateReview(reviewId, reviewData) {
        try {
            const dataToUpdate = {
                ...reviewData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Handle custom date if provided
            if (reviewData.reviewDate) {
                const customDate = new Date(reviewData.reviewDate);
                dataToUpdate.createdAt = firebase.firestore.Timestamp.fromDate(customDate);
                delete dataToUpdate.reviewDate; // Remove the reviewDate field since we set createdAt
            }
            
            await this.reviewsCollection.doc(reviewId).update(dataToUpdate);
            this.showNotification('Recensione aggiornata con successo!', 'success');
            this.loadReviews();
            return true;
        } catch (error) {
            console.error('Error updating review:', error);
            this.showNotification('Errore nell\'aggiornare la recensione', 'error');
            throw error;
        }
    }

    editReview(reviewId, reviewData) {
        // Populate the edit modal with current review data
        document.getElementById('edit-review-id').value = reviewId;
        document.getElementById('edit-client-name').value = reviewData.clientName || '';
        document.getElementById('edit-rating').value = reviewData.rating || 5;
        document.getElementById('edit-nationality').value = reviewData.nationality || '';
        document.getElementById('edit-service').value = reviewData.service || '';
        document.getElementById('edit-profile-image').value = reviewData.profileImage || '';
        document.getElementById('edit-comment').value = reviewData.comment || '';
        
        // Set the date field if createdAt exists
        if (reviewData.createdAt) {
            let date;
            if (reviewData.createdAt.toDate) {
                date = reviewData.createdAt.toDate();
            } else if (reviewData.createdAt instanceof Date) {
                date = reviewData.createdAt;
            }
            
            if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                document.getElementById('edit-review-date').value = `${year}-${month}-${day}`;
            }
        }

        // Trigger preview update
        const event = new Event('input', { bubbles: true });
        document.getElementById('edit-client-name').dispatchEvent(event);

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editReviewModal'));
        modal.show();
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
        
        // Update homepage statistics with calculated values
        this.updateHomepageStats(visibleReviews, reviews);
        
        if (visibleReviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Nessuna recensione disponibile al momento.</p>
                </div>
            `;
            return;
        }

        // Prepara i commenti troncati e completi per toggle
        this.reviewComments = {};
        visibleReviews.forEach(review => {
            this.reviewComments[review.id] = {
                full: this.escapeHtml(review.comment),
                truncated: this.escapeHtml(review.comment).length > 150 ? this.escapeHtml(review.comment).substring(0, 150) + '...' : this.escapeHtml(review.comment)
            };
        });

        reviewsContainer.innerHTML = visibleReviews.map(review => {
            const commentData = this.reviewComments[review.id];
            const needsExpansion = commentData.full.length > 150;
            return `
            <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
                <div class="review-card">
                    <div class="d-flex align-items-center mb-2">
                        <div class="me-2" style="min-width:40px;max-width:40px;">
                            ${review.profileImage ? `<img src="${review.profileImage}" alt="Profile" class="rounded-circle" style="width:36px;height:36px;object-fit:cover;">` : `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width:36px;height:36px;"><i class='fas fa-user text-white'></i></div>`}
                        </div>
                        <div>
                            <h5 class="review-name mb-0">${this.escapeHtml(review.clientName)}</h5>
                            <div class="review-rating">
                                ${this.generateStars(review.rating)}
                            </div>
                        </div>
                    </div>
                    <div class="review-tags mb-3">
                        <span class="review-tag nationality-tag">${review.nationality || '🌍 Unknown'}</span>
                        <span class="review-tag service-tag">🛠️ ${review.service || 'General Service'}</span>
                    </div>
                    <p class="review-comment" id="public-comment-${review.id}">"${commentData.truncated}"</p>
                    ${needsExpansion ? `<button class="btn btn-sm btn-link p-0 text-decoration-none" id="public-toggle-btn-${review.id}" onclick="reviewsManager.togglePublicCommentDetails('${review.id}')"><i class='fas fa-eye me-1'></i>Vedi dettagli</button>` : ''}
                    <small class="review-date">${this.formatDate(review.createdAt)}</small>
                </div>
            </div>
            `;
        }).join('');
    }

    // Toggle per la parte pubblica
    togglePublicCommentDetails(reviewId) {
        const commentElement = document.getElementById(`public-comment-${reviewId}`);
        const buttonElement = document.getElementById(`public-toggle-btn-${reviewId}`);
        if (!commentElement || !buttonElement || !this.reviewComments || !this.reviewComments[reviewId]) return;
        const { full, truncated } = this.reviewComments[reviewId];
        if (commentElement.innerHTML.replace(/"/g, '') === truncated.replace(/"/g, '')) {
            // Espandi
            commentElement.innerHTML = '"' + full + '"';
            buttonElement.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Nascondi dettagli';
        } else {
            // Riduci
            commentElement.innerHTML = '"' + truncated + '"';
            buttonElement.innerHTML = '<i class="fas fa-eye me-1"></i>Vedi dettagli';
        }
    }

    // Update homepage statistics with calculated values from reviews
    updateHomepageStats(visibleReviews, allReviews) {
        try {
            // Calculate satisfaction percentage from average rating
            if (visibleReviews.length > 0) {
                const totalRating = visibleReviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0);
                const averageRating = totalRating / visibleReviews.length;
                const satisfactionPercentage = Math.round((averageRating / 5) * 100);
                
                // Update satisfaction stat in homepage
                const satisfactionElement = document.querySelector('#nightyeight .stat-value');
                if (satisfactionElement) {
                    satisfactionElement.textContent = satisfactionPercentage + '%';
                }
                
                console.log(`📊 Updated satisfaction: ${satisfactionPercentage}% (avg rating: ${averageRating.toFixed(1)}/5 from ${visibleReviews.length} reviews)`);
            }
            
        } catch (error) {
            console.error('Error updating homepage stats:', error);
        }
    }

    displayAdminReviews(reviews) {
        const adminReviewsList = document.getElementById('admin-reviews-list');
        if (!adminReviewsList || !this.currentUser) return;

        // Store all reviews for filtering and searching
        this.allReviews = [...reviews];
        this.currentReviews = {};
        reviews.forEach(review => {
            this.currentReviews[review.id] = review;
        });

        // Apply current filters
        this.filterAndDisplayReviews();
    }

    filterAndDisplayReviews() {
        if (!this.allReviews) return;

        let filteredReviews = [...this.allReviews];

        // Apply search filter
        const searchTerm = document.getElementById('reviews-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filteredReviews = filteredReviews.filter(review => 
                review.clientName.toLowerCase().includes(searchTerm) ||
                review.comment.toLowerCase().includes(searchTerm) ||
                (review.nationality && review.nationality.toLowerCase().includes(searchTerm)) ||
                (review.service && review.service.toLowerCase().includes(searchTerm))
            );
        }

        // Apply visibility filter
        const visibilityFilter = document.getElementById('reviews-filter')?.value || 'all';
        if (visibilityFilter === 'visible') {
            filteredReviews = filteredReviews.filter(review => review.visible);
        } else if (visibilityFilter === 'hidden') {
            filteredReviews = filteredReviews.filter(review => !review.visible);
        }

        // Apply sorting
        const sortOption = document.getElementById('reviews-sort')?.value || 'newest';
        filteredReviews.sort((a, b) => {
            switch (sortOption) {
                case 'oldest':
                    return a.createdAt?.toDate() - b.createdAt?.toDate() || 0;
                case 'rating-high':
                    return b.rating - a.rating;
                case 'rating-low':
                    return a.rating - b.rating;
                case 'name':
                    return a.clientName.localeCompare(b.clientName);
                case 'newest':
                default:
                    return b.createdAt?.toDate() - a.createdAt?.toDate() || 0;
            }
        });

        this.renderFilteredReviews(filteredReviews);
    }

    renderFilteredReviews(reviews) {
        const adminReviewsList = document.getElementById('admin-reviews-list');
        if (!adminReviewsList) return;

        if (reviews.length === 0) {
            adminReviewsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nessuna recensione trovata con i filtri correnti.</p>
                </div>
            `;
            return;
        }

        adminReviewsList.innerHTML = reviews.map(review => {
            const maxChars = 150;
            const comment = this.escapeHtml(review.comment);
            const truncatedComment = comment.length > maxChars ? comment.substring(0, maxChars) + '...' : comment;
            const needsExpansion = comment.length > maxChars;
            
            return `
            <div class="admin-review-item ${!review.visible ? 'hidden-review' : ''}">
                <div class="me-3" style="min-width:56px;max-width:56px;">
                    ${review.profileImage ? `<img src="${review.profileImage}" alt="Profile" class="rounded-circle" style="width:48px;height:48px;object-fit:cover;">` : `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width:48px;height:48px;"><i class='fas fa-user text-white'></i></div>`}
                </div>
                <div class="review-info">
                    <h6>${this.escapeHtml(review.clientName)} - ${this.generateStars(review.rating)}</h6>
                    <div class="mb-2">
                        <span class="badge bg-primary me-2">${review.nationality || '🌍 Unknown'}</span>
                        <span class="badge bg-secondary">🛠️ ${review.service || 'General Service'}</span>
                        ${!review.visible ? '<span class="badge bg-warning text-dark ms-2">👁️‍🗨️ Nascosta</span>' : ''}
                    </div>
                    <p class="review-comment-text" id="comment-${review.id}">${truncatedComment}</p>
                    ${needsExpansion ? `
                        <button class="btn btn-sm btn-link p-0 text-decoration-none" id="toggle-btn-${review.id}" onclick="reviewsManager.toggleCommentDetails('${review.id}')">
                            <i class="fas fa-eye me-1"></i>Vedi dettagli
                        </button>
                    ` : ''}
                    <small class="d-block mt-2">${this.formatDate(review.createdAt)}</small>
                </div>
                <div class="review-actions">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="reviewsManager.openEditModal('${review.id}')">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="reviewsManager.duplicateReview('${review.id}')" title="Duplica recensione">
                        <i class="fas fa-copy"></i> Duplica
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="reviewsManager.toggleReviewVisibility('${review.id}', ${review.visible})">
                        ${review.visible ? '<i class="fas fa-eye-slash"></i> Nascondi' : '<i class="fas fa-eye"></i> Mostra'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="reviewsManager.deleteReview('${review.id}')">
                        <i class="fas fa-trash"></i> Elimina
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
        // Store the full comments for toggling
        this.reviewComments = {};
        reviews.forEach(review => {
            this.reviewComments[review.id] = {
                full: this.escapeHtml(review.comment),
                truncated: this.escapeHtml(review.comment).length > 150 ? 
                          this.escapeHtml(review.comment).substring(0, 150) + '...' : 
                          this.escapeHtml(review.comment)
            };
        });
    }

    openEditModal(reviewId) {
        const review = this.currentReviews[reviewId];
        if (!review) {
            console.error('Review not found:', reviewId);
            return;
        }
        
        this.editReview(reviewId, review);
    }

    async duplicateReview(reviewId) {
        const review = this.currentReviews[reviewId];
        if (!review) {
            console.error('Review not found:', reviewId);
            return;
        }

        if (!confirm('Vuoi duplicare questa recensione?')) {
            return;
        }

        try {
            // Create a copy of the review data without the ID
            const duplicatedReview = {
                clientName: review.clientName + ' (Copia)',
                rating: review.rating,
                comment: review.comment,
                nationality: review.nationality,
                service: review.service,
                profileImage: review.profileImage,
                visible: false, // Set as hidden by default for review
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.addReview(duplicatedReview);
            this.showNotification('Recensione duplicata con successo!', 'success');
        } catch (error) {
            console.error('Error duplicating review:', error);
            this.showNotification('Errore nel duplicare la recensione', 'error');
        }
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

    // Toggle comment details expansion/collapse
    toggleCommentDetails(reviewId) {
        console.log('Toggling comment details for review:', reviewId);
        
        const commentElement = document.getElementById(`comment-${reviewId}`);
        const buttonElement = document.getElementById(`toggle-btn-${reviewId}`);
        
        console.log('Comment element:', commentElement);
        console.log('Button element:', buttonElement);
        console.log('Review comments data:', this.reviewComments && this.reviewComments[reviewId]);
        
        if (!commentElement || !buttonElement || !this.reviewComments || !this.reviewComments[reviewId]) {
            console.error('Elements not found for review:', reviewId);
            return;
        }
        
        const { full, truncated } = this.reviewComments[reviewId];
        
        if (commentElement.innerHTML === truncated) {
            // Expand to show full comment
            commentElement.innerHTML = full;
            buttonElement.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Nascondi dettagli';
            console.log('Expanded comment');
        } else {
            // Collapse to show truncated comment
            commentElement.innerHTML = truncated;
            buttonElement.innerHTML = '<i class="fas fa-eye me-1"></i>Vedi dettagli';
            console.log('Collapsed comment');
        }
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
                service: formData.get('service'),
                profileImage: formData.get('profileImage') || '',
                reviewDate: formData.get('reviewDate') // Add the custom date field
            };
            await reviewsManager.addReview(reviewData);
            e.target.reset();
        });
    }

    // Admin reviews filters and search
    const reviewsSearch = document.getElementById('reviews-search');
    const reviewsFilter = document.getElementById('reviews-filter');
    const reviewsSort = document.getElementById('reviews-sort');

    if (reviewsSearch) {
        reviewsSearch.addEventListener('input', () => {
            if (reviewsManager && reviewsManager.filterAndDisplayReviews) {
                reviewsManager.filterAndDisplayReviews();
            }
        });
    }

    if (reviewsFilter) {
        reviewsFilter.addEventListener('change', () => {
            if (reviewsManager && reviewsManager.filterAndDisplayReviews) {
                reviewsManager.filterAndDisplayReviews();
            }
        });
    }

    if (reviewsSort) {
        reviewsSort.addEventListener('change', () => {
            if (reviewsManager && reviewsManager.filterAndDisplayReviews) {
                reviewsManager.filterAndDisplayReviews();
            }
        });
    }
});
