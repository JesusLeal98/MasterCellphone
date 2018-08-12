var passport = require("passport");
var Usuario = require("./models/usuario");

var LocalStrategy = require("passport-local").Strategy;

module.exports = () => {
    passport.serializeUser((usuario, done)=>{
        done(null, usuario._id);
    });
    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (err, usuario)=>{
            done(err, usuario);
        });
    });
};

passport.use("login", new
LocalStrategy(function(username, password, done){
    Usuario.findOne({username:username}, function(err, usuario){
        if (err){
            return done(err);
        }
        if (!usuario){
            return done (null, false,{message:"No existe ningun usuario con ese nombre"})
        }
        usuario.checkPassword(password,(err, isMatch) =>{
            if (err){
                return done(err);
            }
            if (isMatch){
                return done(null, usuario)
            }else {
                return done(null, false,{message:"La contraseña no es válida"})
            }
        })
    })
}
))