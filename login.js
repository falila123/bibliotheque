// ======= Vider le localStorage au chargement =======
localStorage.removeItem("currentUser");

// ======= Charger les comptes de test =======
document.addEventListener('DOMContentLoaded', function() {
    loadTestAccounts();
    setupLoginForm();
});

// Fonction pour charger les comptes de test
function loadTestAccounts() {
    fetch('data/users.json?v=' + new Date().getTime())
        .then(response => response.json())
        .then(users => {
            const accountsList = document.getElementById('accountsList');
            accountsList.innerHTML = ''; // Vider la liste

            users.forEach(user => {
                const accountDiv = document.createElement('div');
                accountDiv.className = 'account-item';
                
                // Déterminer la classe du badge selon le rôle
                let badgeClass = 'badge-role';
                switch(user.role.toLowerCase()) {
                    case 'étudiant':
                        badgeClass += ' badge-etudiant';
                        break;
                    case 'bibliothécaire':
                        badgeClass += ' badge-bibliothecaire';
                        break;
                    case 'administrateur':
                        badgeClass += ' badge-administrateur';
                        break;
                    case 'administration':
                        badgeClass += ' badge-administration';
                        break;
                }

                accountDiv.innerHTML = `
                    <div class="account-name">
                        <span><i class="fas fa-user-circle"></i> ${user.nom}</span>
                        <span class="${badgeClass}">${user.role}</span>
                    </div>
                    <div class="account-email">
                        <i class="fas fa-envelope"></i> ${user.email}
                    </div>
                `;

                // Ajouter l'événement click pour pré-remplir le formulaire
                accountDiv.addEventListener('click', function() {
                    document.getElementById('email').value = user.email;
                    document.getElementById('password').value = user.password; // Pré-remplir aussi le password
                    document.getElementById('message').textContent = '';
                    document.getElementById('loginForm').focus();
                });

                accountsList.appendChild(accountDiv);
            });
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement des comptes de test:', error);
            document.getElementById('accountsList').innerHTML = 
                '<p style="color: #dc3545;">Erreur lors du chargement des comptes.</p>';
        });
}

// Fonction pour configurer le formulaire de connexion
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageDiv = document.getElementById('message');

    // Vérifications basiques
    if (!email) {
        messageDiv.textContent = '❌ Veuillez entrer votre email';
        messageDiv.className = 'error';
        document.getElementById('email').focus();
        return;
    }

    if (!password) {
        messageDiv.textContent = '❌ Veuillez entrer votre mot de passe';
        messageDiv.className = 'error';
        document.getElementById('password').focus();
        return;
    }

    messageDiv.textContent = '⏳ Vérification des identifiants...';

    // 🔥 Charger depuis users.json ET localStorage
    fetch('data/users.json?v=' + new Date().getTime())
        .then(response => response.json())
        .then(jsonUsers => {
            // 🔥 Charger les utilisateurs du localStorage
            const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
            
            // 🔥 FUSIONNER : users.json + localStorage
            // 1. Ajouter les statuts du localStorage aux utilisateurs du JSON
            const users = jsonUsers.map(jsonUser => {
                const storedUser = storedUsers.find(su => su.email === jsonUser.email);
                if (storedUser && storedUser.status) {
                    return { ...jsonUser, status: storedUser.status };
                }
                return jsonUser;
            });

            // 2. Ajouter les utilisateurs créés localement (qui ne sont pas dans users.json)
            storedUsers.forEach(storedUser => {
                const existsInJson = jsonUsers.find(ju => ju.email === storedUser.email);
                if (!existsInJson) {
                    users.push(storedUser);
                }
            });

            console.log("📋 Utilisateurs fusionnés (JSON + localStorage):", users);
            performLogin(users, email, password, messageDiv);
        })
        .catch(error => {
            console.error('❌ Erreur de connexion:', error);
            messageDiv.textContent = '❌ Erreur serveur. Veuillez réessayer plus tard.';
            messageDiv.className = 'error';
        });
}

function performLogin(users, email, password, messageDiv) {
    // Chercher l'utilisateur par email ET mot de passe
    const user = users.find(u => 
        u.email === email && u.password === password
    );

    if(user) {
        // 🔥 VÉRIFIER SI LE COMPTE EST ACTIF
        const status = user.status || 'actif';
        console.log(`DEBUG: User ${user.email} status = "${status}"`);
        
        if(status === 'inactif') {
            // ❌ Compte désactivé
            messageDiv.textContent = '❌ Compte désactivé. Veuillez contacter l\'administrateur.';
            messageDiv.className = 'error';
            console.warn(`⚠️ Tentative de connexion échouée pour ${email}: compte désactivé`);
            return;
        }

        // ✅ Connexion réussie ET compte actif
        const displayName = user.nom || user.name || email;
        messageDiv.textContent = `✅ Connexion réussie ! Bienvenue ${displayName}`;
        messageDiv.className = 'success';
        
        // Sauvegarder l'utilisateur
        localStorage.setItem("currentUser", JSON.stringify(user));

        console.log(`🔐 Connexion réussie pour ${displayName} (${user.role})`);

        // Redirection après 1.5 secondes
        setTimeout(() => {
            redirectByRole(user.role);
        }, 1500);

    } else {
        // ❌ Identifiants incorrects
        const emailExists = users.find(u => u.email === email);
        
        if (emailExists) {
            messageDiv.textContent = '❌ Mot de passe incorrect';
            messageDiv.className = 'error';
            document.getElementById('password').focus();
            console.warn(`⚠️ Tentative de connexion échouée pour ${email}: mot de passe incorrect`);
        } else {
            messageDiv.textContent = '❌ Email ou mot de passe incorrect';
            messageDiv.className = 'error';
            document.getElementById('email').focus();
            console.warn(`⚠️ Tentative de connexion échouée: email ${email} non trouvé`);
        }
    }
}

// Fonction de redirection selon le rôle
function redirectByRole(role) {
    const roleNormalized = role.toLowerCase();

    const dashboards = {
        "étudiant": "dashboard-etudiant.html",
        "bibliothécaire": "dashboard-bibliothecaire.html",
        "administrateur": "dashboard-admin.html",
        "administration": "dashboard-administration.html"
    };

    const targetPage = dashboards[roleNormalized];

    if(targetPage) {
        console.log(`🔄 Redirection vers ${targetPage}`);
        window.location.href = targetPage;
    } else {
        console.error(`❌ Rôle non reconnu: ${role}`);
        document.getElementById('message').textContent = '❌ Rôle non reconnu!';
        document.getElementById('message').className = 'error';
    }
}

console.log("✅ login.js chargé avec succès");