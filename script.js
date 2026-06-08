// AC Marketplace JavaScript

const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.getElementById('logout');
const showLoginButton = document.getElementById('show-login');
const showRegisterButton = document.getElementById('show-register');
const showBrowseButton = document.getElementById('show-browse');
const showPostFormButton = document.getElementById('show-post-form');
const landingBrowseButton = document.getElementById('landing-browse');
const landingAccountButton = document.getElementById('landing-account');
const backToLandingAuth = document.getElementById('back-to-landing-auth');
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
const itemImageInput = document.getElementById('item-image');
const itemUniversityInput = document.getElementById('item-university');
const itemLocationInput = document.getElementById('item-location');

let activeSearchTerm = '';

function getStorage(key, defaultValue) {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
        return JSON.parse(raw);
    } catch {
        return defaultValue;
    }
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getAccounts() {
    return getStorage('acMarketplaceAccounts', []);
}

function getAds() {
    return getStorage('acMarketplaceAds', []);
}

function getCurrentUser() {
    return localStorage.getItem('acMarketplaceCurrentUser');
}

function setCurrentUser(username) {
    if (username) localStorage.setItem('acMarketplaceCurrentUser', username);
    else localStorage.removeItem('acMarketplaceCurrentUser');
}

function showMessage(message, type = 'info') {
    authMessage.textContent = message;
    authMessage.style.display = 'block';
    authMessage.style.backgroundColor = type === 'error' ? '#fed7d7' : '#e6fffa';
    authMessage.style.borderColor = type === 'error' ? '#fc8181' : '#81e6d9';
    authMessage.style.color = type === 'error' ? '#742a2a' : '#2c7a7b';
}

function clearMessage() {
    authMessage.textContent = '';
    authMessage.style.display = 'none';
}

function updateAuthState() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        currentUserLabel.textContent = `Logged in as ${currentUser}`;
        postAdForm.classList.remove('hidden');
        marketplacePanel.classList.remove('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        logoutButton.classList.add('hidden');
        currentUserLabel.textContent = '';
        postAdForm.classList.add('hidden');
    }
}

function renderAds(filterTerm = '') {
    const ads = getAds();
    const searchTerm = filterTerm.trim().toLowerCase();
    const visibleAds = searchTerm
        ? ads.filter(ad =>
            ad.title.toLowerCase().includes(searchTerm) ||
            ad.description.toLowerCase().includes(searchTerm) ||
            ad.price.toLowerCase().includes(searchTerm) ||
            ad.user.toLowerCase().includes(searchTerm) ||
            (ad.university || '').toLowerCase().includes(searchTerm) ||
            (ad.location || '').toLowerCase().includes(searchTerm)
        )
        : ads;

    if (visibleAds.length === 0) {
        adsContainer.innerHTML = '<p>No ads match your search yet. Try a different keyword or clear the filter.</p>';
        return;
    }

    adsContainer.innerHTML = visibleAds
        .slice()
        .reverse()
        .map(ad => `
            <div class="ad-card">
                ${ad.image ? `<img src="${ad.image}" alt="${escapeHtml(ad.title)}">` : ''}
                <h4>${escapeHtml(ad.title)}</h4>
                <div class="ad-meta">
                    <span>Seller: ${escapeHtml(ad.user)}</span>
                    <span>University: ${escapeHtml(ad.university || 'Not specified')}</span>
                    <span>Location: ${escapeHtml(ad.location || 'Not specified')}</span>
                    <span>Price: ${escapeHtml(ad.price)}</span>
                </div>
                <p>${escapeHtml(ad.description)}</p>
            </div>
        `)
        .join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
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
    renderAds(activeSearchTerm);
}

function showAccountView() {
    landingPanel.classList.add('hidden');
    marketplacePanel.classList.add('hidden');
    authPanel.classList.remove('hidden');
    toggleAuthForms(true);
    clearMessage();
}

function togglePostForm() {
    if (!getCurrentUser()) {
        showMessage('Login to post a new item.', 'error');
        return;
    }
    postAdForm.classList.toggle('hidden');
}

function toggleMarketplace() {
    marketplacePanel.classList.toggle('hidden');
    if (!marketplacePanel.classList.contains('hidden')) {
        renderAds(activeSearchTerm);
    }
}

function registerUser() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    if (!username || !password) {
        showMessage('Please enter both username and password.', 'error');
        return;
    }

    const accounts = getAccounts();
    if (accounts.some(account => account.username.toLowerCase() === username.toLowerCase())) {
        showMessage('That username is already taken.', 'error');
        return;
    }

    accounts.push({ username, password });
    setStorage('acMarketplaceAccounts', accounts);
    setCurrentUser(username);
    clearFormFields();
    showMessage('Registration successful. You are now logged in.');
    updateAuthState();
    renderAds(activeSearchTerm);
}

function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
        showMessage('Please enter both username and password.', 'error');
        return;
    }

    const accounts = getAccounts();
    const account = accounts.find(account => account.username.toLowerCase() === username.toLowerCase());
    if (!account || account.password !== password) {
        showMessage('Invalid username or password.', 'error');
        return;
    }

    setCurrentUser(account.username);
    clearFormFields();
    showMessage('Login successful. Welcome back!');
    updateAuthState();
    marketplacePanel.classList.remove('hidden');
    renderAds(activeSearchTerm);
}

function logoutUser() {
    setCurrentUser(null);
    updateAuthState();
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
    const user = getCurrentUser();

    if (!user) {
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

    const ads = getAds();
    ads.push({ title, price, description, location, user, university, image: imageData, createdAt: new Date().toISOString() });
    setStorage('acMarketplaceAds', ads);
    clearFormFields();
    showMessage('Your ad has been posted successfully.');
    renderAds(activeSearchTerm);
    if (!postAdForm.classList.contains('hidden')) {
        postAdForm.classList.add('hidden');
    }
}

function performSearch() {
    activeSearchTerm = searchInput.value;
    renderAds(activeSearchTerm);
}

function clearSearch() {
    activeSearchTerm = '';
    searchInput.value = '';
    renderAds('');
}

function initializeApp() {
    toggleAuthForms(true);
    clearMessage();
    showLanding();
    updateAuthState();
    renderAds(activeSearchTerm);
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

showLoginButton.addEventListener('click', () => showAccountView());
showRegisterButton.addEventListener('click', () => {
    showAccountView();
    toggleAuthForms(false);
});
showBrowseButton.addEventListener('click', showPublicBrowse);
landingBrowseButton.addEventListener('click', showPublicBrowse);
landingAccountButton.addEventListener('click', showAccountView);
backToLandingAuth.addEventListener('click', showLanding);
backToLandingMarketplace.addEventListener('click', showLanding);
logoutButton.addEventListener('click', logoutUser);
showPostFormButton.addEventListener('click', togglePostForm);
loginButton.addEventListener('click', loginUser);
registerButton.addEventListener('click', registerUser);
postAdButton.addEventListener('click', postAd);
searchButton.addEventListener('click', performSearch);
clearSearchButton.addEventListener('click', clearSearch);

document.addEventListener('DOMContentLoaded', initializeApp);
