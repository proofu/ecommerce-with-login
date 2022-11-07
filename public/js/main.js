const socket = io();

// Enviar productos
socket.on("from-server-productos", (productos) => {
  let htmlProductos = (() => {
    let productMap = new Map(Object.entries(productos));
    let html = "";
    productMap.forEach((cur, i) => {
      if (i <= productos.length - 1) {
        html += `<tr>
              <td>${cur.name}</td>
              <td>${cur.price}</td>
              <td><img src="${cur.thumbnail}" width="50"></td></tr>`;
      } else {
        console.log(`no more products`);
        return;
      }
    });
    return html;
  })();
  console.log(htmlProductos);
  let headerTabla = `<tr style="color: yellow">
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Foto</th>
                    </tr>`;
  document.querySelector("#historial-almacenado").innerHTML =
    headerTabla + htmlProductos;
});
function enviarProducto() {
  const inputName = document.querySelector("#name");
  const inputPrice = document.querySelector("#price");
  const inputThumbnail = document.querySelector("#thumbnail");

  const producto = {
    name: inputName.value,
    price: inputPrice.value,
    thumbnail: inputThumbnail.value,
  };

  socket.emit("from-client-producto", producto);
}

// enviar mensajes
socket.on("from-server-mensajes", (mensajes) => {
  render(mensajes);
});
function render(mensajes) {
  console.log(`log mensajes client ${JSON.stringify(mensajes)}`);
  function loopMensajes() {
    let htmlMensajes = "";
    for (const mensaje of mensajes) {
      htmlMensajes += `<span style="font-weight:bold color:blue"><b>${mensaje.author}</b><span style="color:brown">[${mensaje.timestamp}]</span>: <span style="color:green">${mensaje.text}</span></span><br>`;
    }
    return htmlMensajes;
  }
  const cuerpoMensajesHTML = loopMensajes();
  document.querySelector("#historial").innerHTML = cuerpoMensajesHTML;
}
function enviarMensaje() {
  const inputUser = document.querySelector("#user");
  const inputContenido = document.querySelector("#contenidoMensaje");

  const mensaje = {
    author: inputUser.value,
    text: inputContenido.value,
  };

  socket.emit("from-client-mensaje", mensaje);
}
