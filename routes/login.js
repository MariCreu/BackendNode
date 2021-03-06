var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

/**
 * GOOGLE
 */
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);






/**
 * AUTENTICACIÓN NORMAL
 */
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //CREAR UN TOKEN
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 hores
        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD.id,
            token: token,
            menu: obtenerMenu(usuarioBD.role)
        });

    })





});

/**
 * AUTHENTICACION CON GOOGLE
 */


// ASYNC ES UNA FUNCION QUE DEVUELVE UNA PROMESA
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
//verify().catch(console.error);
app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token google no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 hores
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role)
                });

            }
        } else {
            //El usuario no existe....hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 hores
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role)
                });

            });

        }
    });
});

function obtenerMenu(Role) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RXJS', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //{ titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];
    if (Role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }



    return menu;
}



// res.status(200).json({
//     ok: true,
//     mensaje: 'ok!!',
//     googleUser: googleUser
// });
// });



module.exports = app;