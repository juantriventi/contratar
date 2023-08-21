const editPhotoLink = document.getElementById('editPhotoLink');
const photoFormContainer = document.getElementById('photoFormContainer');

editPhotoLink.addEventListener('click', (event) => {
  event.preventDefault(); // Evita que el enlace redireccione
  photoFormContainer.style.display = 'block'; // Muestra el formulario y el botón
});

const editDescriptionLink = document.getElementById('editDescriptionLink');
const descriptionFormContainer = document.getElementById('descriptionFormContainer');

editDescriptionLink.addEventListener('click', (event) => {
event.preventDefault();
descriptionFormContainer.style.display = 'block';
});