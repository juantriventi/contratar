const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require("../models/user")

// Ruta para mostrar el formulario de inicio de sesión
router.get('/', (req, res) => {
  res.render('index'); 
});

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/'); 
  }
  res.render('login');
});

// Ruta para procesar el formulario de inicio de sesión
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return next(err);
      }
  
      if (!user) {
        console.log('Autenticación fallida:', info.message);
        return res.redirect('/login');
      }
  
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error(loginErr);
          return next(loginErr);
        }
  
        console.log('Autenticación exitosa:', user);
        return res.redirect('/');
      });
    })(req, res, next);
  });

// Ruta para mostrar el formulario de registro
router.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/'); 
  }
  res.render('signup');
});

// Ruta para procesar el formulario de registro
router.post('/signup', async (req, res) => {
  try {
    // Crear un nuevo usuario con los datos del formulario
    const newUser = new User({
      fullName: req.body.fullName,
      username: req.body.username,
      profession: req.body.profession, 
      price: req.body.price,
      contact: req.body.contact
    });

    // Registrar el usuario en la base de datos
    await User.register(newUser, req.body.password);

    // Autenticar al usuario recién registrado
    passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.render('signup', { error: error.message });
  }
});

// Ruta para mostrar el perfil del usuario
router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
  res.render('profile', { user: req.user }); // Pasa el usuario autenticado a la vista
  } else {
    res.render("login")
  }
});


router.post('/update-profile-image', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profileImage = req.body.profileImage; // Actualiza el campo de la imagen de perfil con la URL ingresada
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.redirect('/profile');
  }
});

// Ruta para actualizar la descripción del perfil
router.post('/update-profile-description', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.description = req.body.description; // Actualiza el campo de descripción con el texto ingresado
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.redirect('/profile');
  }
});



// Ruta para mostrar la lista de usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users', { users }); // Renderiza la vista 'all-users' y pasa la lista de usuarios como contexto
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error al obtener la lista de usuarios.' });
  }
});


// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect('/');
  });
});


module.exports = router;
