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
        unit_price: 100, // Monto en centavos (100 pesos)
        quantity: 1,
      },
    ],
    external_reference: userId.toString(), // Referencia externa (puede ser el ID de usuario)
    back_urls: {
      success: 'https://tu-sitio.com/success', // URL de redirección en caso de éxito
      failure: 'https://tu-sitio.com/failure', // URL de redirección en caso de fallo
      pending: 'https://tu-sitio.com/pending', // URL de redirección en caso de pendiente
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



app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
