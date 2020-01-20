var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Busqueda general
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    //La i para que no tenga en cuenta mayuscualas
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });



});

/**
 *Busqueda por colección
 *
 */
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');
    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son usuarios, médicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    // al poner [] no es la palabra tabla, si no el resultado de lo que tenga esa variable
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;