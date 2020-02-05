var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;

/**
 * 
 * Verificar Token
 */

exports.verificaToken = function (req, res, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();

    });
};
/**
 * 
 * Verificar ADMIN
 */

exports.verificaADMIN_ROLE = function (req, res, next) {

    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'NO ES ADMINISTRADOR',
            error: { message:' No es administrador - No tiene permisos'}
        });
    }
};
/**
 * 
 * Verificar ADMIN o Mismo Usuario
 */

exports.verificaADMIN_ROLE_o_MismoUsuario = function (req, res, next) {

    var usuario = req.usuario;
    var id= req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id===id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'NO ES ADMINISTRADOR, ni es el mismo usuario',
            error: { message:' No es administrador - No tiene permisos'}
        });
    }
};