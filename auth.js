// ======= Gestion de la session utilisateur pour affichage =======
// (Vérification auth faite par check-auth.js)

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Afficher le nom de l'utilisateur
const userNameElement = document.getElementById("userName");
if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.nom;
}

// Afficher le rôle (optionnel)
const userRoleElement = document.getElementById("userRole");
if (userRoleElement && currentUser) {
    userRoleElement.textContent = currentUser.role;
}

console.log("✅ login.js chargé - Utilisateur:", currentUser?.nom);