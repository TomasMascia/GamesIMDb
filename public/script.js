import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoJUX4GiV-T4_vAP7xPJOKCGNK5vko_Sk",
    authDomain: "games-imdb.firebaseapp.com",
    projectId: "games-imdb",
    storageBucket: "games-imdb.firebasestorage.app",
    messagingSenderId: "14245298374",
    appId: "1:14245298374:web:28dd62f4470449fc9e97c7"
};

const RAWG_KEY = "e3fb94b48edd4eb48e977592a48af4f7";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Manejo de Vistas
const views = {
    home: document.getElementById('view-home'),
    categories: document.getElementById('view-categories'),
    profile: document.getElementById('view-profile')
};

function showView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    
    if(viewName === 'categories') {
        document.getElementById('category-results-section').classList.add('hidden');
        document.getElementById('category-selector').classList.remove('hidden');
    }
}

document.getElementById('nav-home').onclick = () => showView('home');
document.getElementById('nav-categories').onclick = () => showView('categories');
document.getElementById('user-profile').onclick = () => showView('profile');
document.getElementById('logo-home').onclick = () => showView('home');

// --- LÓGICA DE JUEGOS (INICIO Y CARRUSEL) ---
async function fetchGames() {
    const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=20`);
    const data = await res.json();
    
    // Llenar el Carrusel con el juego más destacado (el primero)
    if(data.results.length > 0) {
        const featured = data.results[0];
        const hero = document.getElementById('hero-carousel');
        hero.style.backgroundImage = `linear-gradient(to top, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.4) 50%, transparent 100%), url('${featured.background_image}')`;
        hero.innerHTML = `
            <div style="max-width: 800px;">
                <div class="game-rating-tag" style="position:relative; display:inline-block; margin-bottom: 15px; font-size: 1rem; padding: 5px 10px;">★ ${featured.rating}</div>
                <h1 style="font-size: 3.5rem; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; line-height: 1;">${featured.name}</h1>
                <p style="color: #ccc; margin-bottom: 20px; font-size: 1.1rem;">Descubre el mundo de ${featured.name} y agrégalo a tu colección.</p>
                <button class="btn-primary" onclick="window.location.href='games.html?id=${featured.id}'">Ver detalles</button>
            </div>
        `;
    }

    renderGrid(data.results, 'games-grid');
}

// --- LÓGICA DE CATEGORÍAS ---
const categorySelector = document.getElementById('category-selector');
const categoryResults = document.getElementById('category-results-section');
const categoryGamesGrid = document.getElementById('category-games-grid');
const categoryTitleDisplay = document.getElementById('category-title-display');
const btnBackCategories = document.getElementById('btn-back-categories');

document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const genre = card.getAttribute('data-genre');
        const genreName = card.querySelector('span').innerText;
        fetchGamesByGenre(genre, genreName);
    });
});

async function fetchGamesByGenre(genre, name) {
    categorySelector.classList.add('hidden');
    categoryResults.classList.remove('hidden');
    categoryTitleDisplay.innerText = `Juegos de ${name}`;
    categoryGamesGrid.innerHTML = '<p class="loader">Buscando títulos...</p>';

    const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&genres=${genre}&page_size=20&ordering=-rating`);
    const data = await res.json();
    renderGrid(data.results, 'category-games-grid');
}

btnBackCategories.onclick = () => {
    categoryResults.classList.add('hidden');
    categorySelector.classList.remove('hidden');
};

// --- RENDERIZADO UNIVERSAL ---
function renderGrid(games, containerId) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = games.map(game => `
        <div class="game-card" onclick="window.location.href='games.html?id=${game.id}'">
            <div class="game-img" style="background-image: url('${game.background_image}')">
                <div class="game-rating-tag">★ ${game.rating}</div>
            </div>
            <h4>${game.name.toLowerCase()}</h4>
        </div>
    `).join('');
}

// --- AUTENTICACIÓN Y PERFIL ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('btn-auth-open').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        
        // Foto por defecto si el usuario no tiene una
        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'G'}&background=f5c518&color=000`;
        const userName = user.displayName || 'Gamer Anonimo';

        document.getElementById('user-name-display').innerText = userName;
        document.getElementById('user-avatar').src = avatarUrl;
        
        // Llenar vista de Perfil
        document.getElementById('profile-img-full').src = avatarUrl;
        document.getElementById('profile-name-full').innerText = userName;
        document.getElementById('profile-bio').innerText = "Amante de los videojuegos. Miembro de GamesIMDb.";
    }
});

fetchGames();