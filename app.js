const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authRoutes = require('./routes/auth');
const User = require('./models/user'); // Define tu modelo de usuario aquí

const app = express();

// Configura el middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


// Configuración de mongoose y conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/contratar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
  res.locals.user = req.user; // Agrega el usuario autenticado a "res.locals"
  next();
});

// Configuración de las rutas
app.use('/', authRoutes); // Ajusta las rutas según tu estructura

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
