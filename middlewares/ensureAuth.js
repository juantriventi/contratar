// Middleware para verificar si el usuario está autenticado
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next(); // Si el usuario está autenticado, continúa
    }
    res.redirect('/login'); // Si no está autenticado, redirige a la página de inicio de sesión
  }

  module.exports = ensureAuthenticated;