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
  