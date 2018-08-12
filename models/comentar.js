var mongoose= require("mongoose");

var comentariosSchema = mongoose.Schema({
    Tipo: {type: String, required: true},
    Comentario: {type: String, required: true},
});


var Comentarios = mongoose.model("Comentarios", comentariosSchema);
module.exports=Comentarios;