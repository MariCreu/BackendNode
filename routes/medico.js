var express = require('express');
var app = express();

var midAuthentication = require('../middlewares/authentication');
var Medico = require('../models/medico');

//OBTENER TODOS LOS medicos
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});
/**
 * Obtener médico
 */
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { 'message': 'No existe un medico con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico
            });
        });
});


/**
 * Actualizar medico
 */
app.put('/:id', midAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    console.log(id);
    console.log(body);
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.usuario = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            medicoGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });


});

//-----CREAR NUEVO medico------------
app.post('/', midAuthentication.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });


});


/**
 * BORRAR UN medico POR ID
 */
app.delete('/:id', midAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;