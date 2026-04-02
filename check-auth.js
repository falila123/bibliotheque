// ======= Vérification IMMÉDIATE de l'authentification =======
// Ce script doit être chargé en PREMIER dans toutes les pages protégées

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// 🚨 Si aucun utilisateur connecté → redirection vers login
if (!currentUser) {
    console.warn("❌ Pas d'utilisateur connecté - Redirection vers login");
    window.location.replace("login.html");
} else {
    verifyUserAccess();
}

// ======= Vérification des accès selon le rôle =======
function verifyUserAccess() {

    const currentPage = window.location.pathname.split('/').pop() || "index.html";

    // Sécurisation : vérifier que role existe
    if (!currentUser.role) {
        console.warn("⚠️ Rôle utilisateur invalide");
        logout();
        return;
    }

    const userRole = currentUser.role.toLowerCase();

    const accessControl = {

        "étudiant": [
            "dashboard-etudiant.html",
            "catalogue.html",
            "mes-demandes.html",
            "profil.html"
        ],

        "bibliothécaire": [
            "dashboard-bibliothecaire.html",
            "gestion-livres.html",
            "demandes-emprunts.html",
            "suivi-emprunts.html"
        ],

        "administrateur": [
            "dashboard-admin.html",
            "gestion-livres-admin.html",
            "gestion-utilisateurs-roles.html",
            "statistiques-admin.html"
        ],

        "administration": [
            "dashboard-administration.html",
            "statistiques.html"
        ]
    };

    const allowedPages = accessControl[userRole];

    if (!allowedPages || !allowedPages.includes(currentPage)) {
        console.warn(`❌ Accès refusé pour ${userRole} sur ${currentPage}`);
        redirectToRoleDashboard(userRole);
    } else {
        console.log(`✅ Accès autorisé pour ${userRole} sur ${currentPage}`);
    }
}

// ======= Redirection vers dashboard selon rôle =======
function redirectToRoleDashboard(role) {

    const dashboards = {
        "étudiant": "dashboard-etudiant.html",
        "bibliothécaire": "dashboard-bibliothecaire.html",
        "administrateur": "dashboard-admin.html",
        "administration": "dashboard-administration.html"
    };

    const targetPage = dashboards[role] || "login.html";

    console.log(`🔄 Redirection vers ${targetPage}`);
    window.location.replace(targetPage);
}

// ======= Déconnexion =======
function logout() {
    console.log("🚪 Déconnexion de", currentUser?.nom);
    localStorage.removeItem("currentUser");
    window.location.replace("login.html");
}