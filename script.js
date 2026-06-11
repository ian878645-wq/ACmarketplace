// AC Marketplace JavaScript

const API_BASE_URL = '';
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.getElementById('logout');
const showLoginButton = document.getElementById('show-login');
const showRegisterButton = document.getElementById('show-register');
const showBrowseButton = document.getElementById('show-browse');
const showPostFormButton = document.getElementById('show-post-form');
const landingBrowseButton = document.getElementById('landing-browse');
const landingAccountButton = document.getElementById('landing-account');
const landingLoginButton = document.getElementById('landing-login');
const landingRegisterButton = document.getElementById('landing-register');
const backToLandingAuth = document.getElementById('back-to-landing-auth');
const accountProfile = document.getElementById('account-profile');
const accountUsername = document.getElementById('account-username');
const accountPhone = document.getElementById('account-phone');
const accountEmail = document.getElementById('account-email');
const saveAccountButton = document.getElementById('save-account-button');
const logoutAccountButton = document.getElementById('logout-account-button');
const backToLandingMarketplace = document.getElementById('back-to-landing-marketplace');
const authMessage = document.getElementById('auth-message');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authPanel = document.getElementById('auth-panel');
const marketplacePanel = document.getElementById('marketplace-panel');
const landingPanel = document.getElementById('landing-panel');
const currentUserLabel = document.getElementById('current-user');
const postAdForm = document.getElementById('post-ad-form');
const adsContainer = document.getElementById('ads-container');
const postAdButton = document.getElementById('post-ad-button');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const clearSearchButton = document.getElementById('clear-search');
const filterUniversitySelect = document.getElementById('filter-university');
const filterPriceSelect = document.getElementById('filter-price');
const itemImageInput = document.getElementById('item-image');
const itemUniversityInput = document.getElementById('item-university');
const itemLocationInput = document.getElementById('item-location');
const itemStatusInput = document.getElementById('item-status');
const itemPhoneInput = document.getElementById('item-phone');
const itemEmailInput = document.getElementById('item-email');
const myAdsContainer = document.getElementById('my-ads-container');
const editAdForm = document.getElementById('edit-ad-form');
const editItemTitle = document.getElementById('edit-item-title');
const editItemPrice = document.getElementById('edit-item-price');
const editItemDescription = document.getElementById('edit-item-description');
const editItemLocation = document.getElementById('edit-item-location');
const editItemUniversity = document.getElementById('edit-item-university');
const editItemStatus = document.getElementById('edit-item-status');
const editItemImage = document.getElementById('edit-item-image');
const editItemPhone = document.getElementById('edit-item-phone');
const editItemEmail = document.getElementById('edit-item-email');
const saveAdButton = document.getElementById('save-ad-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const listingDetailModal = document.getElementById('listing-detail-modal');
const closeListingDetailButton = document.getElementById('close-listing-detail');
const listingDetailContainer = document.getElementById('listing-detail-container');

let activeSearchTerm = '';
let activeUniversityFilter = '';
let activePriceFilter = '';
let currentUser = null;
let currentUserPhone = null;
let currentUserEmail = null;
let currentEditingAdId = null;

async function apiRequest(endpoint, options = {}) {
    const config = {
        credentials: 'include',
        ...options,
        headers: {
            ...(options.headers || {})
        }
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(API_BASE_URL + endpoint, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Server error');
    }
    return data;
}

function showMessage(message, type = 'info') {
    authMessage.textContent = message;
    authMessage.style.display = 'block';
    
    if (type === 'error') {
        authMessage.style.backgroundColor = '#fed7d7';
        authMessage.style.borderColor = '#fc8181';
        authMessage.style.color = '#742a2a';
    } else if (type === 'success') {
        authMessage.style.backgroundColor = '#c6f6d5';
        authMessage.style.borderColor = '#9ae6b4';
        authMessage.style.color = '#22543d';
    } else {
        authMessage.style.backgroundColor = '#e6fffa';
        authMessage.style.borderColor = '#81e6d9';
        authMessage.style.color = '#2c7a7b';
    }
}

function clearMessage() {
    authMessage.textContent = '';
    authMessage.style.display = 'none';
}

function updateAuthState() {
    if (currentUser) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        accountProfile.classList.remove('hidden');
        logoutButton.classList.remove('hidden');
        accountUsername.textContent = `Username: ${currentUser}`;
        accountPhone.value = currentUserPhone || '';
        accountEmail.value = currentUserEmail || '';
        currentUserLabel.textContent = `Logged in as ${currentUser}`;
        postAdForm.classList.remove('hidden');
        marketplacePanel.classList.remove('hidden');
        autoFillContactInfo();
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        accountProfile.classList.add('hidden');
        logoutButton.classList.add('hidden');
        currentUserLabel.textContent = '';
        postAdForm.classList.add('hidden');
    }
}

async function loadCurrentUser() {
    try {
        const data = await apiRequest('/api/auth/me', { method: 'GET' });
        currentUser = data.username;
        currentUserPhone = data.phone || null;
        currentUserEmail = data.email || null;
    } catch {
        currentUser = null;
        currentUserPhone = null;
        currentUserEmail = null;
    }
    }
    updateAuthState();
}

async function fetchAds(searchTerm = '', university = '', priceRange = '') {
    const query = searchTerm.trim();
    const endpoint = query ? `/api/ads?search=${encodeURIComponent(query)}` : '/api/ads';
    const data = await apiRequest(endpoint, { method: 'GET' });
    let ads = data.ads || [];
    
    // Client-side filtering
    if (university) {
        ads = ads.filter(ad => ad.university === university);
    }
    
    if (priceRange) {
        ads = ads.filter(ad => {
            const price = parseFloat(ad.price.replace(/[^0-9.]/g, ''));
            switch(priceRange) {
                case '0-50':
                    return price >= 0 && price < 50;
                case '50-100':
                    return price >= 50 && price < 100;
                case '100-250':
                    return price >= 100 && price < 250;
                case '250-500':
                    return price >= 250 && price < 500;
                case '500+':
                    return price >= 500;
                default:
                    return true;
            }
        });
    }
    
    return ads;
}

async function renderAds(searchTerm = '', university = '', priceRange = '') {
    try {
        const ads = await fetchAds(searchTerm, university, priceRange);
        if (ads.length === 0) {
            adsContainer.innerHTML = '<p>No ads match your search yet. Try a different keyword or clear the filters.</p>';
            return;
        }

        adsContainer.innerHTML = ads
            .map(ad => `
                <div class="ad-card ad-card-clickable" data-ad-id="${ad.id}" style="cursor: pointer;">
                    ${ad.image ? `<img src="${ad.image}" alt="${escapeHtml(ad.title)}">` : ''}
                    <h4>${escapeHtml(ad.title)}</h4>
                    <div class="ad-meta">
                        <span>Seller: ${escapeHtml(ad.user)}</span>
                        <span>University: ${escapeHtml(ad.university || 'Not specified')}</span>
                        <span>Location: ${escapeHtml(ad.location || 'Not specified')}</span>
                        <span>Price: ${escapeHtml(ad.price)}</span>
                        <span class="status-badge status-${escapeHtml(ad.status || 'selling')}">Status: ${escapeHtml(ad.status || 'selling')}</span>
                    </div>
                    <p>${escapeHtml(ad.description)}</p>
                </div>
            `)
            .join('');
        
        // Add click handlers to each ad card
        document.querySelectorAll('.ad-card-clickable').forEach(card => {
            card.addEventListener('click', () => {
                const adId = parseInt(card.getAttribute('data-ad-id'));
                const ad = ads.find(a => a.id === adId);
                if (ad) {
                    showListingDetail(ad);
                }
            });
        });
    } catch (error) {
        adsContainer.innerHTML = '<p>Unable to load ads at this time. Please refresh.</p>';
        showMessage(error.message, 'error');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
}

function toggleAuthForms(showLogin = true) {
    clearMessage();
    if (showLogin) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

function showLanding() {
    landingPanel.classList.remove('hidden');
    authPanel.classList.add('hidden');
    marketplacePanel.classList.add('hidden');
    clearMessage();
}

function showPublicBrowse() {
    landingPanel.classList.add('hidden');
    authPanel.classList.add('hidden');
    marketplacePanel.classList.remove('hidden');
    updateAuthState();
    renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
}

function autoFillContactInfo() {
    const phoneField = document.getElementById('item-phone');
    const emailField = document.getElementById('item-email');
    
    if (phoneField && currentUserPhone) {
        phoneField.value = currentUserPhone;
    }
    if (emailField && currentUserEmail) {
        emailField.value = currentUserEmail;
    }
}

async function saveAccountInfo() {
    const phone = accountPhone.value.trim();
    const email = accountEmail.value.trim();

    try {
        const data = await apiRequest('/api/auth/update-profile', {
            method: 'POST',
            body: {
                phone,
                email
            }
        });
        currentUserPhone = phone;
        currentUserEmail = email;
        showMessage('Account information saved successfully!', 'success');
        autoFillContactInfo();
    } catch (error) {
        showMessage(error.message || 'Failed to save account information', 'error');
    }
}

function showAccountView() {
    landingPanel.classList.add('hidden');
    marketplacePanel.classList.add('hidden');
    authPanel.classList.remove('hidden');
    if (currentUser) {
        updateAuthState();
    } else {
        toggleAuthForms(true);
    }
    clearMessage();
}

function togglePostForm() {
    if (!currentUser) {
        showMessage('Login to post a new item.', 'error');
        return;
    }
    postAdForm.classList.toggle('hidden');
    if (!postAdForm.classList.contains('hidden')) {
        autoFillContactInfo();
    }
}

async function registerUser() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        showMessage('Please enter both username and password.', 'error');
        return;
    }

    try {
        const data = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: { username, password }
        });
        currentUser = data.username;
        clearFormFields();
        showMessage('Registration successful. You are now logged in.');
        updateAuthState();
        renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
        renderUserAds();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showMessage('Please enter both username and password.', 'error');
        return;
    }

    try {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: { username, password }
        });
        currentUser = data.username;
        currentUserPhone = data.phone || null;
        currentUserEmail = data.email || null;
        clearFormFields();
        showMessage('Login successful. Welcome back!');
        updateAuthState();
        marketplacePanel.classList.remove('hidden');
        renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
        renderUserAds();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function logoutUser() {
    try {
        await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
        // ignore
    }
    currentUser = null;
    currentUserPhone = null;
    currentUserEmail = null;
    updateAuthState();
    renderUserAds();
    renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
    showMessage('You have been logged out.');
    toggleAuthForms(true);
}

function clearFormFields() {
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('item-title').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-description').value = '';
    if (itemLocationInput) {
        itemLocationInput.value = '';
    }
    if (itemUniversityInput) {
        itemUniversityInput.value = '';
    }
    if (itemImageInput) {
        itemImageInput.value = '';
    }
    if (itemStatusInput) {
        itemStatusInput.value = 'selling';
    }
    if (itemPhoneInput) {
        itemPhoneInput.value = '';
    }
    if (itemEmailInput) {
        itemEmailInput.value = '';
    }
}

function readImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
}

async function postAd() {
    const title = document.getElementById('item-title').value.trim();
    const price = document.getElementById('item-price').value.trim();
    const description = document.getElementById('item-description').value.trim();
    const location = itemLocationInput ? itemLocationInput.value.trim() : '';
    const status = itemStatusInput ? itemStatusInput.value : 'selling';
    const phone = itemPhoneInput ? itemPhoneInput.value.trim() : '';
    const email = itemEmailInput ? itemEmailInput.value.trim() : '';

    if (!currentUser) {
        showMessage('Please log in before posting an ad.', 'error');
        return;
    }

    const university = itemUniversityInput ? itemUniversityInput.value : '';
    if (!title || !price || !description || !university || !location) {
        showMessage('All item fields are required, including university and location.', 'error');
        return;
    }

    let imageData = null;
    if (itemImageInput && itemImageInput.files.length > 0) {
        try {
            imageData = await readImageFile(itemImageInput.files[0]);
        } catch {
            showMessage('Unable to load the selected image.', 'error');
            return;
        }
    }

    try {
        await apiRequest('/api/ads', {
            method: 'POST',
            body: {
                title,
                price,
                description,
                location,
                university,
                status,
                phone,
                email,
                image: imageData
            }
        });
        clearFormFields();
        showMessage('Your ad has been posted successfully.');
        renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
        renderUserAds();
        if (!postAdForm.classList.contains('hidden')) {
            postAdForm.classList.add('hidden');
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function performSearch() {
    activeSearchTerm = searchInput.value;
    activeUniversityFilter = filterUniversitySelect.value;
    activePriceFilter = filterPriceSelect.value;
    renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
}

function clearSearch() {
    activeSearchTerm = '';
    activeUniversityFilter = '';
    activePriceFilter = '';
    searchInput.value = '';
    filterUniversitySelect.value = '';
    filterPriceSelect.value = '';
    renderAds('', '', '');
}

async function fetchUserAds() {
    try {
        const data = await apiRequest('/api/ads/my-listings', { method: 'GET' });
        return data.ads || [];
    } catch (error) {
        showMessage(error.message, 'error');
        return [];
    }
}

async function renderUserAds() {
    if (!currentUser) {
        myAdsContainer.innerHTML = '<p>Log in to see your listings.</p>';
        return;
    }

    try {
        const ads = await fetchUserAds();
        if (ads.length === 0) {
            myAdsContainer.innerHTML = '<p>You haven\'t posted any items yet.</p>';
            return;
        }

        myAdsContainer.innerHTML = ads
            .map(ad => `
                <div class="ad-card">
                    ${ad.image ? `<img src="${ad.image}" alt="${escapeHtml(ad.title)}">` : ''}
                    <h4>${escapeHtml(ad.title)}</h4>
                    <div class="ad-meta">
                        <span>University: ${escapeHtml(ad.university || 'Not specified')}</span>
                        <span>Location: ${escapeHtml(ad.location || 'Not specified')}</span>
                        <span>Price: ${escapeHtml(ad.price)}</span>
                        <span class="status-badge status-${escapeHtml(ad.status || 'selling')}">Status: ${escapeHtml(ad.status || 'selling')}</span>
                    </div>
                    <p>${escapeHtml(ad.description)}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button onclick="startEditAd(${ad.id})">Edit</button>
                        <button onclick="deleteAd(${ad.id})" class="secondary" style="background-color: #e53e3e;">Delete</button>
                    </div>
                </div>
            `)
            .join('');
    } catch (error) {
        myAdsContainer.innerHTML = '<p>Unable to load your listings.</p>';
        showMessage(error.message, 'error');
    }
}

function startEditAd(adId) {
    const loadUserAdsAndEdit = async () => {
        try {
            const ads = await fetchUserAds();
            const ad = ads.find(a => a.id === adId);
            if (!ad) {
                showMessage('Ad not found.', 'error');
                return;
            }

            currentEditingAdId = adId;
            editItemTitle.value = ad.title;
            editItemPrice.value = ad.price;
            editItemDescription.value = ad.description;
            editItemLocation.value = ad.location;
            editItemUniversity.value = ad.university;
            editItemStatus.value = ad.status;
            editItemImage.value = '';

            editAdForm.classList.remove('hidden');
            editAdForm.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showMessage('Unable to load ad for editing.', 'error');
        }
    };
    loadUserAdsAndEdit();
}

function cancelEditAd() {
    editAdForm.classList.add('hidden');
    currentEditingAdId = null;
    editItemTitle.value = '';
    editItemPrice.value = '';
    editItemDescription.value = '';
    editItemLocation.value = '';
    editItemUniversity.value = '';
    editItemStatus.value = 'selling';
    editItemImage.value = '';
}

function showListingDetail(ad) {
    listingDetailContainer.innerHTML = `
        <div class="listing-detail">
            ${ad.image ? `<div class="listing-detail-image"><img src="${escapeHtml(ad.image)}" alt="${escapeHtml(ad.title)}"></div>` : ''}
            <div class="listing-detail-info">
                <h2>${escapeHtml(ad.title)}</h2>
                <div class="detail-section">
                    <h3>Price</h3>
                    <p class="detail-price">${escapeHtml(ad.price)}</p>
                </div>
                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${escapeHtml(ad.description)}</p>
                </div>
                <div class="detail-section">
                    <h3>Item Details</h3>
                    <p><strong>Status:</strong> <span class="status-badge status-${escapeHtml(ad.status || 'selling')}">${escapeHtml(ad.status || 'selling')}</span></p>
                    <p><strong>Location:</strong> ${escapeHtml(ad.location || 'Not specified')}</p>
                    <p><strong>University:</strong> ${escapeHtml(ad.university || 'Not specified')}</p>
                </div>
                <div class="detail-section">
                    <h3>Seller Information</h3>
                    <p><strong>Seller:</strong> ${escapeHtml(ad.user)}</p>
                    <p><strong>Posted:</strong> ${new Date(ad.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;
    listingDetailModal.classList.remove('hidden');
    listingDetailModal.scrollIntoView({ behavior: 'smooth' });
}

function closeListingDetail() {
    listingDetailModal.classList.add('hidden');
    listingDetailContainer.innerHTML = '';
}

async function saveEditedAd() {
    if (!currentEditingAdId) {
        showMessage('No ad selected for editing.', 'error');
        return;
    }

    const title = editItemTitle.value.trim();
    const price = editItemPrice.value.trim();
    const description = editItemDescription.value.trim();
    const location = editItemLocation.value.trim();
    const university = editItemUniversity.value;
    const status = editItemStatus.value;

    if (!title || !price || !description || !location || !university) {
        showMessage('All fields are required.', 'error');
        return;
    }

    let imageData = null;
    if (editItemImage.files.length > 0) {
        try {
            imageData = await readImageFile(editItemImage.files[0]);
        } catch {
            showMessage('Unable to load the selected image.', 'error');
            return;
        }
    }

    try {
        const body = {
            title,
            price,
            description,
            location,
            university,
            status
        };
        if (imageData) {
            body.image = imageData;
        }

        await apiRequest(`/api/ads/${currentEditingAdId}`, {
            method: 'PUT',
            body: body
        });

        showMessage('Your ad has been updated successfully.');
        cancelEditAd();
        renderUserAds();
        renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function deleteAd(adId) {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
        return;
    }

    try {
        await apiRequest(`/api/ads/${adId}`, {
            method: 'DELETE'
        });

        showMessage('Your ad has been deleted successfully.');
        renderUserAds();
        renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function initializeApp() {
    toggleAuthForms(true);
    clearMessage();
    showLanding();
    loadCurrentUser();
    updateAuthState();
    renderAds(activeSearchTerm, activeUniversityFilter, activePriceFilter);
    renderUserAds();
    attachFormShortcuts();
}

function attachFormShortcuts() {
    if (searchInput) {
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                performSearch();
            }
        });
    }

    ['login-username', 'login-password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    loginUser();
                }
            });
        }
    });

    ['register-username', 'register-password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    registerUser();
                }
            });
        }
    });
}

showLoginButton.addEventListener('click', () => {
    if (currentUser) {
        showMessage('You are already logged in. Please logout first if you want to login with a different account.', 'info');
        return;
    }
    showAccountView();
});
showRegisterButton.addEventListener('click', () => {
    if (currentUser) {
        showMessage('You are already logged in. Please logout first if you want to create a new account.', 'info');
        return;
    }
    showAccountView();
    toggleAuthForms(false);
});
showBrowseButton.addEventListener('click', showPublicBrowse);
landingBrowseButton.addEventListener('click', showPublicBrowse);
landingAccountButton.addEventListener('click', showAccountView);
landingLoginButton.addEventListener('click', () => {
    if (currentUser) {
        showMessage('You are already logged in. Please logout first if you want to login with a different account.', 'info');
        return;
    }
    showAccountView();
});
landingRegisterButton.addEventListener('click', () => {
    if (currentUser) {
        showMessage('You are already logged in. Please logout first if you want to create a new account.', 'info');
        return;
    }
    showAccountView();
    toggleAuthForms(false);
});
backToLandingAuth.addEventListener('click', showLanding);
backToLandingMarketplace.addEventListener('click', showLanding);
logoutButton.addEventListener('click', logoutUser);
saveAccountButton.addEventListener('click', saveAccountInfo);
logoutAccountButton.addEventListener('click', logoutUser);
showPostFormButton.addEventListener('click', togglePostForm);
loginButton.addEventListener('click', loginUser);
registerButton.addEventListener('click', registerUser);
postAdButton.addEventListener('click', postAd);
searchButton.addEventListener('click', performSearch);
clearSearchButton.addEventListener('click', clearSearch);
filterUniversitySelect.addEventListener('change', performSearch);
filterPriceSelect.addEventListener('change', performSearch);
saveAdButton.addEventListener('click', saveEditedAd);
cancelEditButton.addEventListener('click', cancelEditAd);
closeListingDetailButton.addEventListener('click', closeListingDetail);

document.addEventListener('DOMContentLoaded', initializeApp);
