import { model, Schema } from "mongoose";

const usuarioSchema = new Schema({
    nombre: {type: String, required: true},
    password: {type: String, required: true},
    direccion: {type: Array, required: true}
});

export const usuarioModel = model('usuarios', usuarioSchema);