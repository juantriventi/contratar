const express = require('express');
const passport = require('passport');
const multer = require('multer');
const router = express.Router();
const User = require("../models/user")

router.get('/', async (req, res) => {
  try {
    let userCount = 0;
    let offerCount = 0; // Inicializar el contador de ofertas

    // Obtener el estado de autenticación del usuario
    const isAuthenticated = req.isAuthenticated();
    if (req.isAuthenticated()) {
      const users = await User.find({});
      
      // Contar usuarios que no son reclutadores o tienen un precio definido
      userCount = users.filter(user => user.profession !== 'Reclutador' || user.price).length;

      // Contar el número total de ofertas en todos los usuarios
      users.forEach(user => {
        const ofertasArray = Array.isArray(user.ofertas) ? user.ofertas : [];
        offerCount += ofertasArray.length;
      });
    }
    
    res.render('index', { userCount, offerCount, isAuthenticated }); // Pasar las variables a la vista
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error al obtener la lista de usuarios.' });
  }
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
  
        console.log('Autenticación exitosa:', user.username);
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
      contact: req.body.contact,
      email: req.body.email,
      profileImage: '/images/blank_profile.png'
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

  // Obtener el estado de autenticación del usuario
  const isAuthenticated = req.isAuthenticated();

  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user , isAuthenticated }); // Pasa el usuario autenticado a la vista
  } else {
    res.render("login")
  }
});

// Configura la configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Define la carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Ruta para actualizar la imagen de perfil
router.post('/update-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Actualiza el campo de la imagen de perfil con la URL del archivo cargado
    user.profileImage = '/uploads/' + req.file.filename;

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

     // Obtener el estado de autenticación del usuario
     const isAuthenticated = req.isAuthenticated();
    
    
    res.render('users', { users , isAuthenticated}); 
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error al obtener la lista de usuarios.' });
  }
});


// Agrega esta función en tu archivo de rutas junto con tus otras rutas y lógica
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Ruta para mostrar la vista de trabajos (jobs)
router.get('/jobs', async (req, res) => {

   // Obtener el estado de autenticación del usuario
   const isAuthenticated = req.isAuthenticated();

  if (req.isAuthenticated()) {
    try {
      const users = await User.find().lean();

      // Crear un array de todas las ofertas de todos los usuarios
      let allOfertas = [];
      users.forEach(user => {
        const ofertasArray = user.ofertas || [];

        // Filtrar las ofertas por categoría si se proporciona un parámetro de consulta
        if (req.query.categoria && typeof req.query.categoria === 'string') {
          const categoriaFilter = req.query.categoria.toLowerCase();
          const filteredOfertas = ofertasArray.filter(oferta =>
            oferta.categoria && oferta.categoria.toLowerCase() === categoriaFilter
          );
          allOfertas = allOfertas.concat(filteredOfertas);
        } else {
          allOfertas = allOfertas.concat(ofertasArray);
        }
      });

      // Mezclar el array de todas las ofertas en un orden aleatorio
      const shuffledOfertas = shuffleArray(allOfertas);
      return res.render('jobs', {
        users,
        ofertasArray: shuffledOfertas,
        errorMessage: null,
        isAuthenticated
      });
    } catch (error) {
      console.error(error);
      return res.redirect('/jobs');
    }
  }
  res.render('login');
});




router.post('/users/create-offer', async (req, res) => {
  try {
    const { categoria, precio, descripcion, oferta } = req.body;

    const user = await User.findById(req.user._id); 
    if (!user) {
      return res.redirect('/jobs'); 
    }

    user.ofertas = user.ofertas || '[]'; 
    const ofertasArray = user.ofertas; 

    // Verificar si el usuario ya tiene 5 ofertas
    if (ofertasArray.length >= 5) {
      return res.redirect('/jobs'); 
    }

    // Agregar la nueva oferta al array con categoría, precio y descripción
    ofertasArray.push({
      titulo: oferta, // Título de la oferta
      categoria,      // Categoría de la oferta
      precio,         // Precio de la oferta
      descripcion,    // Descripción de la oferta
      userId: user._id,
      user: {
        profileImage: user.profileImage, // Imagen del usuario almacenada en la base de datos
        username: user.username,
        email: user.email
      },
      fechaCreacion: new Date()
    });
    // Convertir el array de ofertas de nuevo a una cadena JSON
    user.ofertas = ofertasArray;

    await user.save(); 

    res.redirect('/jobs');
  } catch (error) {
    console.error(error);
    // Renderizar la vista de trabajos con un mensaje de error
    res.render('jobs', { user: req.user, errorMessage: 'Error! Solo puedes tener 5 ofertas activas.' });
  }
});


router.post('/users/delete-offer', async (req, res) => {
  try {
    const { offerCategory, offerPrice, offerDescription } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.redirect('/jobs');
    }

    if (user.ofertas && Array.isArray(user.ofertas)) {
      const uniqueOfferIdentifier = offerCategory + offerPrice + offerDescription;
      const updatedOfertasArray = user.ofertas.filter(oferta => {
        const ofertaIdentifier = oferta.categoria + oferta.precio + oferta.descripcion;
        return ofertaIdentifier !== uniqueOfferIdentifier;
      });

      user.ofertas = updatedOfertasArray;
      await user.save();
    }

    res.redirect('/jobs');
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error al eliminar la oferta.' });
  }
});


// Ruta para pricing
router.get('/pricing', (req, res) => {

  // Obtener el estado de autenticación del usuario
  const isAuthenticated = req.isAuthenticated();

  if (req.isAuthenticated()) {
    res.render('pricing', { user: req.user , isAuthenticated }); // Pasa el usuario autenticado a la vista
  } else {
    res.render("login")
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