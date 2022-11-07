import ContenedorMemoria from "../../container/contenedorMemoria.js";
import { generarProducto } from "../../utils/generarDatos.js";

class productosDaoMemoria extends ContenedorMemoria {
  constructor() {
    super();
  }

  generarDatos(cant = 50) {
    let listaPopulate = [];
    for (let index = 0; index < cant; index++) {
      listaPopulate.push(generarProducto());
    }
    return listaPopulate;
  }

  almacenar(listaPopulate) {
    for (const elemento of listaPopulate) {
      let newId = 0;
      if (this.elementos.length == 0) {
        newId = 1;
      } else {
        newId = this.elementos[this.elementos.length - 1].id + 1;
      }

      this.elementos.push({ id: newId, ...elemento });
    }
    return listaPopulate;
  }
}

export default productosDaoMemoria;
