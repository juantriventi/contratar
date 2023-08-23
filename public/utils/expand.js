
/*Expando usuarios*/
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".user-card");
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      this.classList.toggle("expanded");
    });
    const arrow = card.querySelector(".arrow-down");
    arrow.addEventListener("click", function (event) {
      event.stopPropagation();
      card.classList.toggle("expanded");
    });
    const breadcrumb = card.querySelector(".breadcrumb");
    breadcrumb.addEventListener("click", function (event) {
      event.stopPropagation(); // Detiene la propagación del evento de clic
    });
  });
});