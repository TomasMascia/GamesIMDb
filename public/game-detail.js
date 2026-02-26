import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');

async function loadGame() {
    if (!gameId) return;
    const res = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${RAWG_KEY}`);
    const game = await res.json();

    const main = document.getElementById('game-page-content');
    main.innerHTML = `
        <div class="game-hero" style="background-image: url('${game.background_image}')">
            <div class="hero-content">
                <h1 class="game-logo-large">${game.name.toLowerCase()}</h1>
                <div>${game.genres.map(g => `<span class="tag">${g.name}</span>`).join('')}</div>
                <div style="font-size: 2rem; margin-top: 20px;">★ ${game.rating}/5</div>
            </div>
        </div>
        <section class="game-info-bottom">
            <h2 style="font-weight: 300; margin-bottom: 20px;">Sobre el juego</h2>
            <div style="color: #aaa; line-height: 1.8;">${game.description}</div>
            <div style="margin-top: 40px; background: #222; padding: 30px; border-radius: 15px;">
                <h3>Tu Reseña</h3>
                <textarea id="user-review" style="width:100%; height:100px; background:#000; color:white; border:1px solid #333; padding:10px; margin: 15px 0; border-radius:10px;"></textarea>
                <button id="btn-save" class="btn-primary" style="width: auto; padding: 10px 30px;">Guardar en mi lista</button>
            </div>
        </section>
    `;

    document.getElementById('btn-save').onclick = () => saveToFirebase(game.name);
}

async function saveToFirebase(name) {
    const user = auth.currentUser;
    if (!user) return alert("Inicia sesión primero");
    const review = document.getElementById('user-review').value;
    await updateDoc(doc(db, "users", user.uid), {
        "lists.jugados": arrayUnion({ id: gameId, name: name, review: review, date: new Date() })
    });
    alert("¡Guardado!");
}

loadGame();