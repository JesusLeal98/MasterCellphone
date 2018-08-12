
var mongoose= require("mongoose");

var celularesSchema = mongoose.Schema({
    Nombre: {type: String, required: true},
    Color: {type: String, required: true},
    TamPantalla: {type: String, required: true},
    CamaraPixeles: {type: String, required: true},
    Capacidad: {type: String, required: true},
    Especificaciones: {type: String, required: true},
    ID: {type: String, required: true}
});


var Celulares = mongoose.model("Celulares", celularesSchema);
module.exports=Celulares;
