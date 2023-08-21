function togglePriceField() {
    const professionSelect = document.querySelector('select[name="profession"]');
    const priceSelect = document.querySelector('select[name="price"]');
    const selectedProfession = professionSelect.value;

    if (selectedProfession === "Reclutador") {
      priceSelect.classList.add('hidden');
      priceSelect.removeAttribute('required'); // Remove the 'required' attribute
    } else {
      priceSelect.classList.remove('hidden');
      priceSelect.setAttribute('required', 'required'); // Add the 'required' attribute
    }
  }