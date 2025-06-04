// js/ui.js

/**
 * Oculta todas las secciones (<section>) y muestra solo la que tenga la clase .active.
 * Recibe el id de la sección a activar.
 * @param {string} id 
 */
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/**
 * Crea y retorna un elemento <div class="product-card"> con la info de p.
 * @param {Object} p – objeto producto
 * @returns {HTMLDivElement}
 */
function crearTarjeta(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.tabIndex = 0; // para accesibilidad: permitir foco con teclado

  // Click sobre la tarjeta abre el modal
  card.addEventListener("click", () => mostrarModalDetalles(p));

  // Contenedor de imagen
  const imgCont = document.createElement("div");
  imgCont.className = "image-container";
  const img = document.createElement("img");
  img.src = p.image || "assets/placeholder.png";
  img.alt = p.image ? p.nombre : "sin imagen";
  imgCont.appendChild(img);

  // Contenedor de info
  const info = document.createElement("div");
  info.className = "info";
  const titulo = document.createElement("h2");
  titulo.className = "product-title";
  titulo.textContent = p.nombre;
  const desc = document.createElement("p");
  desc.innerHTML = `<strong>Descripción:</strong> ${p.descripcion}`;
  const elab = document.createElement("p");
  elab.innerHTML = `<strong>Elaboración:</strong> ${p.elaboracion}`;

  // Cálculo de promedio
  const promedio = p.rating.length
    ? (p.rating.reduce((a, b) => a + b, 0) / p.rating.length).toFixed(1)
    : "Sin calificaciones";
  const estrellas = document.createElement("p");
  estrellas.className = "stars";
  estrellas.textContent = `⭐ ${promedio}`;

  // Botón ordenar
  const botonOrdenar = document.createElement("button");
  botonOrdenar.className = "order-btn";
  botonOrdenar.textContent = "Ordenar";
  botonOrdenar.addEventListener("click", (e) => {
    e.stopPropagation();
    mostrarModalDetalles(p);
  });

  info.append(titulo, desc, elab, estrellas, botonOrdenar);
  card.append(imgCont, info);
  return card;
}

/**
 * Carga en #listaProductos una lista de tarjetas a partir de un array de productos.
 * @param {Array} productos 
 */
function renderProductos(productos) {
  const cont = document.getElementById("listaProductos");
  cont.innerHTML = "";
  productos.forEach(p => {
    const tarjeta = crearTarjeta(p);
    cont.appendChild(tarjeta);
  });
}

/**
 * Muestra un modal con detalles completos de p, acciones de calificación y pedido.
 * @param {Object} p 
 */
function mostrarModalDetalles(p) {
  // Si ya hay un modal abierto, lo cerramos
  const existente = document.getElementById("modal");
  if (existente) existente.remove();

  // Fondo del modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  // Contenido del modal
  const contenido = document.createElement("div");
  contenido.className = "modal-content";

  // Título
  const h2 = document.createElement("h2");
  h2.textContent = p.nombre;

  // Vendedor, elaboración, descripción, precio, stock, pago
  const vendedor = document.createElement("p");
  vendedor.innerHTML = `<strong>Vendedor:</strong> ${p.vendedor}`;
  const elab = document.createElement("p");
  elab.innerHTML = `<strong>Elaboración:</strong> ${p.elaboracion}`;
  const desc = document.createElement("p");
  desc.innerHTML = `<strong>Descripción:</strong> ${p.descripcion}`;
  const precio = document.createElement("p");
  precio.innerHTML = `<strong>Precio:</strong> $${p.precio}`;
  const stock = document.createElement("p");
  stock.innerHTML = `<strong>Unidades Disponibles:</strong> ${p.cantidad}`;
  const pago = document.createElement("p");
  pago.innerHTML = `<strong>Pago:</strong> ${p.pago}`;

  // Contenedor de estrellas (rating)
  const starsContainer = document.createElement("div");
  starsContainer.className = "rating-stars";
  [1, 2, 3, 4, 5].forEach(n => {
    const span = document.createElement("span");
    span.textContent = "★";
    span.addEventListener("click", () => {
      calificarProducto(p.nombre, n);   // viene de productos.js
      alert(`Gracias por tu calificación de ${n} estrella(s)!`);
      cerrarModal();
      recargarVistaProductos();
    });
    starsContainer.appendChild(span);
  });

  // Botones: “Tomar Pedido” y “Cerrar”
  const botonPedido = document.createElement("button");
  botonPedido.className = "order-btn";
  botonPedido.textContent = "Tomar Pedido";
  botonPedido.addEventListener("click", () => mostrarOrderForm(p.nombre));

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());

  // Contenedor donde se inyectará el formulario de pedido
  const orderFormContainer = document.createElement("div");
  orderFormContainer.id = "orderFormContainer";

  // Armamos el contenido
  contenido.append(h2, vendedor, elab, desc, precio, stock, pago);
  contenido.append(starsContainer, botonPedido, botonCerrar, orderFormContainer);
  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // Trap focus (para accesibilidad), enfocamos el botón Cerrar
  botonCerrar.focus();
}

/**
 * Cierra el modal si existe.
 */
function cerrarModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.remove();
}

/**
 * Muestra dentro del modal el formulario de pedido para el producto de nombre “nombreProd”.
 * @param {string} nombreProd 
 */
function mostrarOrderForm(nombreProd) {
  const cont = document.getElementById("orderFormContainer");
  cont.innerHTML = "";

  const form = document.createElement("form");
  form.className = "order-form";

  // Nombre Cliente
  const labelCliente = document.createElement("label");
  labelCliente.setAttribute("for", "cliente");
  labelCliente.textContent = "Nombre Cliente:";
  const inputCliente = document.createElement("input");
  inputCliente.type = "text";
  inputCliente.name = "cliente";
  inputCliente.required = true;

  // Teléfono
  const labelTelefono = document.createElement("label");
  labelTelefono.setAttribute("for", "telefono");
  labelTelefono.textContent = "Número de Celular:";
  const inputTelefono = document.createElement("input");
  inputTelefono.type = "tel";
  inputTelefono.name = "telefono";
  inputTelefono.required = true;

  // Dirección
  const labelDireccion = document.createElement("label");
  labelDireccion.setAttribute("for", "direccion");
  labelDireccion.textContent = "Dirección:";
  const inputDireccion = document.createElement("input");
  inputDireccion.type = "text";
  inputDireccion.name = "direccion";
  inputDireccion.required = true;

  // Cantidad
  const labelCantidad = document.createElement("label");
  labelCantidad.setAttribute("for", "cantidad");
  labelCantidad.textContent = "Cantidad:";
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.name = "cantidad";
  inputCantidad.min = 1;
  inputCantidad.required = true;

  // Detalle Pedido
  const labelDetalle = document.createElement("label");
  labelDetalle.setAttribute("for", "detalle");
  labelDetalle.textContent = "Detalle Pedido:";
  const textareaDetalle = document.createElement("textarea");
  textareaDetalle.name = "detalle";

  // Método de Pago
  const labelPago = document.createElement("label");
  labelPago.setAttribute("for", "metodoPago");
  labelPago.textContent = "Método de Pago:";
  const selectPago = document.createElement("select");
  selectPago.name = "metodoPago";
  ["Transferencia Nequi", "Transferencia Daviplata", "Bancolombia", "PSE", "Débito/Crédito"]
    .forEach(opt => {
      const o = document.createElement("option");
      o.textContent = opt;
      selectPago.appendChild(o);
    });

  // Botón Guardar Pedido
  const botonGuardar = document.createElement("button");
  botonGuardar.type = "submit";
  botonGuardar.className = "order-btn";
  botonGuardar.textContent = "Guardar Pedido";

  // Agregar todos los inputs al form
  form.append(
    labelCliente, inputCliente,
    labelTelefono, inputTelefono,
    labelDireccion, inputDireccion,
    labelCantidad, inputCantidad,
    labelDetalle, textareaDetalle,
    labelPago, selectPago,
    botonGuardar
  );

  // Al enviar el form, llama a procesarPedido (definida en productos.js)
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const cantidadSolicitada = parseInt(inputCantidad.value, 10);
    const exito = procesarPedido(nombreProd, cantidadSolicitada);
    cont.innerHTML = ""; // borramos el form
    const resDiv = document.createElement("div");
    if (exito) {
      resDiv.className = "order-result success";
      resDiv.innerHTML = `<div class="icon">✓</div>Pedido Exitoso`;
      recargarVistaProductos();
    } else {
      resDiv.className = "order-result failure";
      resDiv.innerHTML = `<div class="icon">✖</div>Pedido Fallido`;
    }
    cont.appendChild(resDiv);
  });

  cont.appendChild(form);
}

/**
 * Recarga la vista de productos de la sección INICIO.
 * Obtiene nuevamente los productos y los renderiza.
 */
function recargarVistaProductos() {
  const lista = obtenerProductos();
  renderProductos(lista);
}

/**
 * Muestra el contenido de “Mi Perfil” (perfil y formulario de creación de producto).
 * Si no hay usuario logueado, muestra el mensaje “Debes iniciar sesión...”
 */
function mostrarPerfilEnPantalla() {
  const perfilSec = document.getElementById("perfil");
  const nombre = getUserName(); // de auth.js
  if (!nombre) {
    perfilSec.innerHTML = `
      <div class="product-card">
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </div>
    `;
    return;
  }

  const userEmail = getUserEmail();
  const listaAll = obtenerProductos();
  const productosPropios = listaAll.filter(p => p.creatorEmail === userEmail);
  const notifs = obtenerNotificaciones(userEmail);

  // Limpiar sección primero
  perfilSec.innerHTML = "";

  // Bloque de perfil básico
  const perfilInfo = document.createElement("div");
  perfilInfo.className = "product-card";
  perfilInfo.innerHTML = `
    <h2 class="product-title">Mi Perfil</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Email:</strong> ${getUserEmail()}</p>
    <button id="btn-logout" class="order-btn">Cerrar sesión</button>
  `;
  perfilSec.appendChild(perfilInfo);

  // Bloque: Mis Productos
  const productosCont = document.createElement("div");
  productosCont.innerHTML = `<h2 class="product-title">Mis Productos</h2>`;
  if (productosPropios.length > 0) {
    productosPropios.forEach(p => {
      const card = crearTarjeta(p);
      productosCont.appendChild(card);
    });
  } else {
    productosCont.innerHTML += `<p>Aún no has creado ningún producto.</p>`;
  }
  perfilSec.appendChild(productosCont);

  // Bloque: Notificaciones
  const notifsCont = document.createElement("div");
  notifsCont.innerHTML = `<h2 class="product-title">Notificaciones de Pedidos</h2>`;
  if (notifs.length > 0) {
    notifs.forEach(n => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <p><strong>Producto:</strong> ${n.producto}</p>
        <p><strong>Cantidad:</strong> ${n.cantidad}</p>
        <p><strong>Comprador:</strong> ${n.comprador}</p>
        <p><strong>Fecha:</strong> ${new Date(n.fecha).toLocaleString()}</p>
      `;
      notifsCont.appendChild(div);
    });
  } else {
    const p = document.createElement("p");
    p.textContent = "No tienes nuevas notificaciones.";
    notifsCont.appendChild(p);
  }
  perfilSec.appendChild(notifsCont);

  // Bloque: Crear Producto
  const crearProd = document.createElement("div");
  crearProd.className = "product-card";
  crearProd.innerHTML = `
    <h2 class="product-title">Crear Producto</h2>
    <form id="productFormPerfil">
      <input type="text" id="nombreProducto" placeholder="Nombre del Producto" required />
      <textarea id="descripcionProducto" placeholder="Descripción" required></textarea>
      <textarea id="elaboracionProducto" placeholder="Cómo se elabora" required></textarea>
      <input type="number" id="precioProducto" placeholder="Precio" required />
      <input type="number" id="cantidadProducto" placeholder="Cantidad Disponible" required />
      <input type="text" id="vendedorProducto" placeholder="Vendedor o Empresa" required />
      <input type="text" id="pagoProducto" placeholder="Medios de Pago" required />
      <select id="categoriaProducto" required>
        <option value="comida">Comida</option>
        <option value="ropa">Ropa</option>
        <option value="artesanias">Artesanías</option>
      </select>
      <label for="imagenProducto">Imagen del producto:</label>
      <input type="file" id="imagenProducto" accept="image/*" />
      <button type="submit" class="order-btn">Publicar Producto</button>
      <p id="productFormError" style="color: red;"></p>
    </form>
  `;
  perfilSec.appendChild(crearProd);

  // Event listener para cerrar sesión
  document.getElementById("btn-logout").addEventListener("click", () => {
    logout();
    showSection("inicio");
    mostrarPerfilEnPantalla(); // para actualizar la vista de perfil
  });

  // Event listener para el form de creación de producto
  document.getElementById("productFormPerfil").addEventListener("submit", function(e) {
    e.preventDefault();
    const nombreProd = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const elaboracion = document.getElementById("elaboracionProducto").value.trim();
    const precio = Number(document.getElementById("precioProducto").value);
    const cantidad = Number(document.getElementById("cantidadProducto").value);
    const vendedor = document.getElementById("vendedorProducto").value.trim();
    const pago = document.getElementById("pagoProducto").value.trim();
    const categoria = document.getElementById("categoriaProducto").value;
    const fileInput = document.getElementById("imagenProducto");
    const errorP = document.getElementById("productFormError");
    errorP.textContent = "";

    // Validaciones básicas
    if (!nombreProd || !descripcion || !elaboracion || precio <= 0 || cantidad <= 0 || !vendedor || !pago) {
      errorP.textContent = "Por favor completa todos los campos correctamente.";
      return;
    }

    // Verificar duplicado de nombre
    const todos = obtenerProductos();
    const existe = todos.some(p => p.nombre.toLowerCase() === nombreProd.toLowerCase());
    if (existe) {
      errorP.textContent = "Ya existe un producto con ese nombre.";
      return;
    }

    // Construimos el objeto producto (agregamos creatorEmail)
    const productoNuevo = {
      nombre: nombreProd,
      descripcion,
      elaboracion,
      precio,
      cantidad,
      vendedor,
      pago,
      categoria,
      empresaDescripcion: "Registrado por usuario",
      rating: [],
      image: null,
      creatorEmail: getUserEmail()  // —– NUEVO: para saber quién lo creó
    };

    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        productoNuevo.image = reader.result;
        agregarProducto(productoNuevo);
        alert("¡Producto publicado!");
        showSection("inicio");
        recargarVistaProductos();
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      agregarProducto(productoNuevo);
      alert("¡Producto publicado!");
      showSection("inicio");
      recargarVistaProductos();
    }
  });
}
