var express= require("express");
var Usuario= require("./models/usuario");
var Celulares = require("./models/celular");
var Comentarios = require("./models/comentar");
var passport=require("passport");
var acl = require('express-acl');
var https = require('https');

const path = require('path');
const multer = require('multer');

var ID;

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        ID = Date.now();
      cb(null,file.fieldname + '-' + ID + ".png");
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

var router= express.Router();

router.use((req,res,next)=>{
    res.locals.currentUsuario=req.usuario;
    res.locals.errors=req.flash("error");
    res.locals.infos=req.flash("info");
    if(req.usuario)
    {
        req.session.rol = req.usuario.rol;
    }
    if (req.session.rol == undefined){
        acl.config({
        defaultRole:'invitado',
    });
    }
    else
    {
        acl.config({
            defaultRole:req.session.rol
        });
    }
    next();
});

router.use(acl.authorize);

router.get("/", (req, res)=>{
    res.render("index");
});

router.get("/login", (req, res)=>{
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect:"/dispositivos",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", (req, res) =>{
    req.session.rol = 'invitado';
    req.logout();
    res.redirect("/");
});

//router.get("/signup", (req, res, next)=>{
router.get("/signup", (req, res)=>{
    res.render("signup");
});

router.post("/signup", (req, res, next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var rol = req.body.rol;

    verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
        if (success) {
                Usuario.findOne({username: username}, (err, usuario)=>{
                    if(err){
                        return next(err);
                    }
                    if(usuario){
                        req.flash("error", "El nombre de usuario ya lo ha usado otra persona");
                        return res.redirect("/signup");
                    }
                        var newUsuario = new Usuario({
                            username: username,
                            password: password,
                            rol: rol
                        });
                        newUsuario.save(next);
                        return res.redirect("/");
                });
                // TODO: do registration using params in req.body
        } else {
                return res.redirect("/signup");
                // TODO: take them back to the previous page
                // and for the love of everyone, restore their inputs
        }
});
});

var SECRET = "6LddxGgUAAAAAKCllQZiwFdKkwvXau2Av0M1ZPa3";

function verifyRecaptcha(key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function (chunk) {
                        data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                console.log(parsedData);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
}

router.get("/usuarios",(req,res,next)=>{
    Usuario.find()
        .exec((err,usuarios)=>{
            if(err){
                return next(err);
            }
            res.render("usuarios",{usuarios:usuarios});
        });
});
    
router.get("/usuarios/:username", (req, res, next)=>{
    Usuario.findOne({username: req.params.username}, (err, usuario)=>{
        if(err){
            return next(err);
        }
        if(!usuario){
            return next(404);
        }
        res.render("profile", {usuario: usuario});
    });
});

router.get("/cel", (req,res,next)=>{
    res.render("cel");
});

router.get("/com", (req,res,next)=>{
    res.render("com");
});

router.post("/cel", (req, res, next)=> {
    upload(req, res, (err) => {
        var Nombre = req.body.Nombre;
        var Color = req.body.Color;
        var TamPantalla = req.body.TamPantalla;
        var CamaraPixeles = req.body.CamaraPixeles;
        var Capacidad = req.body.Capacidad;
        var Especificaciones = req.body.Especificaciones;

        if(err){
            return res.render('cel', {
                msg: err
            });
        }
        else {
            if(req.file == undefined){
                return res.render('cel', {
                    msg: 'Foto no seleccionada'
                })
            }
            else{
                Celulares.findOne((err) => {
                    var newCel = new Celulares({
                        Nombre: Nombre,
                        Color: Color,
                        TamPantalla: TamPantalla,
                        CamaraPixeles: CamaraPixeles,
                        Capacidad: Capacidad,
                        Especificaciones: Especificaciones,
                        ID: ID
                    });
                    newCel.save(next);
                    req.flash("info", "Dispositivo agregado");
                    return res.redirect("/cel");
                });
            }
        }
    });    
});

router.post("/com", (req, res, next)=>{
    var Tipo = req.body.Tipo;
    var Comentario = req.body.Comentario;

    Comentarios.findOne((err)=>{
        
        var newCom = new Comentarios({
            Tipo: Tipo,
            Comentario: Comentario
        });
        newCom.save(next);
        req.flash("info", "Comentario agregado");
        return res.redirect("/com");
    });
});


router.get("/dispositivos", (req, res, next)=>{
    Celulares.find()
    .exec((err, cel)=>{
        if(err)
        {
            return next(err);
        }
        res.render("dispositivos", {cel: cel});
    });

});

router.get("/comentarios", (req, res, next)=>{
    Comentarios.find()
    .exec((err, com)=>{
        if(err)
        {
            return next(err);
        }
        res.render("comentarios", {com: com});
    });

});

router.get("/edit", ensureAuthenticated, (req, res) => {
    res.render("edit");
})

router.post("/edit", ensureAuthenticated, (req, res, next) => {
    req.usuario.displayName = req.body.displayName;
    req.usuario.bio = req.body.bio;
    req.usuario.save((err) => {
        if(err) {
            next(err);
            return;
        }
        req.flash("info", "Perfil actualizado!");
        res.redirect("/edit");
    });
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    }else {
        req.flash("info", "Necesitas iniciar sesion para poder ver esta seccion");
        res.redirect("/login")
    }
}

module.exports=router;