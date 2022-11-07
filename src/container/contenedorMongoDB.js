import mongoose from "mongoose";
import { mongoDb } from "../utils/config.js";



// const strConn = `mongodb://${config.mongoDb.host}:${config.mongoDb.port}/${config.mongoDb.dbName}`;
// const conn = await mongoose.connect(strConn, config.mongoDb.options);

class ContenedorMongoDB {
  constructor(model) {
    this.model = model;
  }

  async connect() {
    try {
      const strConn = `mongodb://${mongoDb.host}:${mongoDb.port}/${mongoDb.dbName}`;
      const conn = await mongoose.connect(strConn, mongoDb.options);
      console.log("base de datos mongoDB conectada!");
    } catch (error) {
      console.log("error al conectar");
      console.log(error);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Base de datos mongoDB desconectada!");
    } catch (error) {
      console.log("error al desconectar base de datos");
      console.log(error);
    }
  }

  async save(obj) {
    try {
      let response = await this.model.create(obj);
      console.log(`Documento insertado`, response);
    } catch (error) {
      console.log("error al guardar documento");
      console.log(error);
    }
  }

  async getAll() {
    try {
      let response = await this.model.find();
      console.log("documentos encontrados", response);
      return response;
    } catch (error) {
      console.log("error al buscar documentos");
      console.log(error);
    }
  }

  async findOneByName(value){
    try {
      this.model.findOne({ nombre: value }).exec()      
    } catch (error) {
      console.log('error al buscar documento');      
      console.log(error);
    }
  }

  async deleteAll() {
    try {
    } catch (error) {
      console.log("error al borrar todo");
      console.log(error);
    }
  }
}

export { ContenedorMongoDB };
