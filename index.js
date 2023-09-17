const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');

const app = express();

// Configura el middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Conectarse a MongoDB Atlas
mongoose.connect("mongodb+srv://juancruztriventi:juancruztriventi@contratar.0vqvfsg.mongodb.net/contratar2?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch(error => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

// Configuración de express-session
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false,
}));

// Configuración de express.urlencoded para analizar datos del formulario
app.use(express.urlencoded({ extended: true }));

// Configuración de passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de passport-local
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware para pasar el usuario autenticado a las vistas
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Configuración de las rutas
app.use('/', authRoutes);


//Mercado pago
app.use(bodyParser.json());

mercadopago.configurations.setAccessToken('TEST-6869864857069449-042416-d523d3cc25c701939dfa1141194e2b64-490506466');

// Configura la ruta para manejar la solicitud POST desde el formulario
app.post('/generate-payment-preference', (req, res) => {
  const userId = req.body.id; // Recupera el ID del usuario del formulario

  // Crea la preferencia de pago en Mercado Pago con los detalles del pago
  const preference = {
    items: [
      {
        title: 'Suscripción Premium',
        unit_price: 10, // Monto en centavos (100 pesos)
        quantity: 1,
      },
    ],
    external_reference: userId.toString(),
    back_urls: {
      success: 'https://www.contratar.com.ar/success',
      failure: 'https://www.contratar.com.ar/failure',
      pending: 'https://www.contratar.com.ar/pending',
    },
  };

  // Crea la preferencia de pago en Mercado Pago
  mercadopago.preferences.create(preference)
    .then((response) => {
      // Obtiene la URL de pago generada
      const paymentUrl = response.body.init_point;

      // Redirige al usuario a la URL de pago de Mercado Pago
      res.redirect(paymentUrl);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Error al generar la preferencia de pago' });
    });
});

// Configura la ruta de éxito para manejar el resultado del pago
app.get('/success', (req, res) => {
  // Verifica el estado del pago utilizando la información proporcionada por Mercado Pago
  const paymentStatus = req.query.status; // Obtén el estado del pago desde la URL (esto depende de cómo lo configures con Mercado Pago)

  if (paymentStatus === 'approved') {
    // Si el pago se ha aprobado, actualiza la propiedad premium a true en tu base de datos
    const userId = req.query.external_reference; // Obtén el ID de usuario desde la URL

    // Aquí deberías tener la lógica para actualizar la propiedad premium del usuario a true en tu base de datos
    // Puedes utilizar tu ORM o librería de base de datos preferida para hacerlo
    // Ejemplo con Mongoose (para MongoDB):
    User.findByIdAndUpdate(userId, { premium: true }, (err, user) => {
      if (err) {
        console.error(err);
        // Manejo de errores
      } else {
        // La propiedad premium del usuario ahora es true
        // Puedes realizar cualquier otra acción necesaria después de la actualización
        res.redirect('/premium-success'); // Redirige a una página de éxito de premium
      }
    });
  } else {
    // Maneja otros estados de pago según sea necesario
    res.redirect('/payment-failure'); // Redirige a una página de fallo de pago
  }
});




app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
