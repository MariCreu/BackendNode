//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



//Inicializar variables
var app = express();


//Body-parser--> parsea el body del request

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var medicoRoutes = require('./routes/medico');
var hospitalRoutes = require('./routes/hospital');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');

//Conexion a la bbdd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);




//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});