const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');
const path = require("path");

const app = express();

// Configura el middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Configuración de las rutas
app.use('/', authRoutes);


//Mercado pago
app.use(bodyParser.json());

mercadopago.configurations.setAccessToken('APP_USR-6869864857069449-042416-97c054571c7a9f1e271565fd14e7ea6f-490506466');

// Configura la ruta para manejar la solicitud POST desde el formulario
app.post('/generate-payment-preference', (req, res) => {
  const userId = req.body.id; 

  const preference = {
    items: [
      {
        title: 'Suscripción Premium',
        unit_price: 10, 
        quantity: 1,
        currency_id:'ARS',
        description:"Pago por suscripcion premium"

      },
    ],
    external_reference: userId.toString(),
    back_urls: {
      success: 'https://www.contratar.com.ar/success',
      failure: 'https://www.contratar.com.ar/failure',
      pending: 'https://www.contratar.com.ar/pending',
    },
    "auto_return": "approved"
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
  const paymentStatus = req.query.status;
  console.log(User.id)
  console.log(paymentStatus)
  if (paymentStatus === 'approved') {

    const userId = req.query.external_reference; // Obtén el ID de usuario desde la URL

    User.findByIdAndUpdate(userId, { premium: true }, (err, user) => {
      if (err) {
        console.error(err);
        console.log(userId)
        console.log(User.id)
        console.log("no pudimos pasar tu usuario a premium")
      } else {
        console.log(userId)
        console.log(User.id)
        console.log("pasamos tu usuario a premium")
        res.redirect('/'); // Redirige a una página de éxito
      }
    });
  } else {
    res.redirect('/error'); // Redirige a una página de fallo
  }
});




app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
