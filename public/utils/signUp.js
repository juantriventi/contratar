//Valido email con REGEX
function validateEmail() {

  const emailField = document.getElementById('user-email');
  const emailError = document.getElementById('email-error');
  
  const validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

  if (validEmail.test(emailField.value)) {
    emailError.textContent = ''; 
    return true;
  } else {
    emailError.textContent = 'Email inválido'; 
    return false;
  }
}