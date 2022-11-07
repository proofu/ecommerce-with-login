import { ContenedorMongoDB } from "../../container/contenedorMongoDB.js";
import { usuarioModel } from "../../models/usuarios.models.js";

class UsuariosDaoMongoDB extends ContenedorMongoDB {
    constructor(){
        super(usuarioModel)
    }
}

export default UsuariosDaoMongoDB;