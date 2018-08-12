var bcrypt= require("bcrypt-nodejs");
var mongoose= require("mongoose");

var SALT_FACTOR=10;
//toma los valores que se crearon en la BD
var usuariosSchema=mongoose.Schema({
    username:{type: String, required: true, unique:true},
    password:{type: String, required:true},
    displayName:{type: String},
    bio: String,
    rol: {type: String, required: true}
});

var donothing=()=>{
}
//Encripta antes de entrar a la base
usuariosSchema.pre("save", function(done){
    var usuario= this;
    if(!usuario.isModified("password")){
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR,(err,salt)=>{
        if(err){
            return done(err);
        }
        bcrypt.hash(usuario.password,salt,donothing,(err,hashedpassword)=>{
            if(err){
                return done (err);
            }
            usuario.password=hashedpassword;
            done ();
        });
    });
});


usuariosSchema.methods.checkPassword= function(guess,done){
    bcrypt.compare(guess,this.password,function(err,isMatch){
        done(err,isMatch);
    });
}

usuariosSchema.methods.name=function(){
    return this.displayName||this.username;
}
usuariosSchema.methods.roles=function(){
    return this.rol||this.rol;
}


var Usuario=mongoose.model("Usuario",usuariosSchema);
module.exports=Usuario;
