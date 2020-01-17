//Requires
var express = require('express');
var mongoose = require('mongoose');



//Inicializar variables
var app = express();


//Conexion a la bbdd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});


//Rutas
app.get('/', (req, res, next) => {

    res.status(403).json({
        ok: true,
        mensaje: 'Petición realizada  correctamente'
    });

});




//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});