import * as dotenv from "dotenv";
dotenv.config();

let mensajesDao;
let productosDao;

switch (process.env.PERS) {
  case "memoria":
    const { default: ProductosDaoMemoria } = await import(
      "./productos/productosDaoMemoria.js"
    );
    const { default: MensajesDaoMemoria } = await import(
      "./mensajes/mensajesDaoMemoria.js"
    );

    productosDao = new ProductosDaoMemoria();
    mensajesDao = new MensajesDaoMemoria();
    break;

  default:
    break;
}

export { mensajesDao, productosDao };
