// Récupération des utilisateurs depuis users.json 
fetch('data/users.json')
  .then(response => {
    console.log('Fetch OK:', response);
    return response.json();
  })
  .then(data => {
    console.log('Données JSON:', data);
    afficherUtilisateurs(data); // <-- on appelle la fonction pour remplir le tableau
  })
  .catch(error => console.error('Erreur fetch JSON:', error));

function afficherUtilisateurs(users) {
  const tbody = document.getElementById('tableauUtilisateurs').querySelector('tbody');
  tbody.innerHTML = ''; // vide le tableau avant de remplir
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.nom}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
    `;
    tbody.appendChild(tr);
  });
}
