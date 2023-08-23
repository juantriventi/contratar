/*Muestro y escondo boton de "Filtrar"*/
  const filterButton = document.getElementById('filter-button');
  const selectElement = document.getElementById('profession-select');
  const title = document.getElementById('profession-title');

  filterButton.addEventListener('click', () => {
    if (selectElement.style.display === 'none') {
      selectElement.style.display = 'block';
      filterButton.textContent = 'Cancelar';
      title.style.marginTop = '40px';
    } else {
      selectElement.style.display = 'none';
      filterButton.textContent = 'Ver filtros';
      title.style.marginTop = '32px'; // Ajusta el margen superior según tu diseño
    }
  });


/*Muestro y escondo boton usuarios según su filtro*/
document.addEventListener("DOMContentLoaded", function () {
  const professionSelect = document.querySelector("#profession-select");
  const cards = document.querySelectorAll(".user-card");

  professionSelect.addEventListener("change", function () {
    const selectedProfession = professionSelect.value;
    cards.forEach((card) => {
      const profession = card.querySelector(".profession").textContent;
      if (selectedProfession === "all" || profession === selectedProfession) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});
  