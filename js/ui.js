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

  // Botón Favorito
  const userEmail = getUserEmail();
  const favoritos = userEmail ? obtenerFavoritos(userEmail) : [];
  const esFavorito = favoritos.includes(p.nombre);
  const botonFavorito = document.createElement("button");
  botonFavorito.className = `order-btn favorite-btn ${esFavorito ? "favorited" : ""}`;
  botonFavorito.textContent = esFavorito ? "★ Quitar de Favoritos" : "☆ Agregar a Favoritos";
  botonFavorito.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!userEmail) {
      alert("Debes iniciar sesión para agregar favoritos.");
      return;
    }
    if (esFavorito) {
      eliminarFavorito(userEmail, p.nombre);
      botonFavorito.textContent = "☆ Agregar a Favoritos";
      botonFavorito.classList.remove("favorited");
    } else {
      agregarFavorito(userEmail, p.nombre);
      botonFavorito.textContent = "★ Quitar de Favoritos";
      botonFavorito.classList.add("favorited");
    }
    // Actualizar la vista de perfil si está abierta
    if (document.getElementById("perfil").classList.contains("active")) {
      mostrarPerfilEnPantalla();
    }
  });

  info.append(titulo, desc, elab, estrellas, botonOrdenar, botonFavorito);
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
  if (productos.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "product-card";
    noResults.innerHTML = "<p>No se encontraron productos.</p>";
    cont.appendChild(noResults);
  } else {
    productos.forEach(p => {
      const tarjeta = crearTarjeta(p);
      cont.appendChild(tarjeta);
    });
  }
}

/**
 * Muestra un modal con detalles completos de p, acciones de calificación, pedido y añadir al carrito.
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

  // Input para cantidad a añadir al carrito
  const labelCantidadCarrito = document.createElement("label");
  labelCantidadCarrito.setAttribute("for", "cantidadCarrito");
  labelCantidadCarrito.textContent = "Cantidad para Carrito:";
  const inputCantidadCarrito = document.createElement("input");
  inputCantidadCarrito.type = "number";
  inputCantidadCarrito.id = "cantidadCarrito";
  inputCantidadCarrito.name = "cantidadCarrito";
  inputCantidadCarrito.min = 1;
  inputCantidadCarrito.max = p.cantidad;
  inputCantidadCarrito.value = 1;
  inputCantidadCarrito.required = true;

  // Mensaje de error para validación
  const carritoError = document.createElement("p");
  carritoError.id = "carritoError";
  carritoError.className = "stock-error";
  carritoError.style.color = "red";

  // Validación en tiempo real para la cantidad
  inputCantidadCarrito.addEventListener("input", () => {
    const cantidad = parseInt(inputCantidadCarrito.value, 10);
    if (cantidad > p.cantidad) {
      carritoError.textContent = `La cantidad solicitada (${cantidad}) excede el stock disponible (${p.cantidad}).`;
      inputCantidadCarrito.setCustomValidity("Cantidad inválida");
    } else {
      carritoError.textContent = "";
      inputCantidadCarrito.setCustomValidity("");
    }
  });

  // Botones: “Tomar Pedido”, “Añadir al Carrito” y “Cerrar”
  const botonPedido = document.createElement("button");
  botonPedido.className = "order-btn";
  botonPedido.textContent = "Tomar Pedido";
  botonPedido.addEventListener("click", () => mostrarOrderForm(p));

  // Botón para añadir al carrito
  const botonCarrito = document.createElement("button");
  botonCarrito.className = "order-btn";
  botonCarrito.textContent = "Añadir al Carrito";
  botonCarrito.addEventListener("click", () => {
    const cantidad = parseInt(inputCantidadCarrito.value, 10);
    if (cantidad > p.cantidad) {
      carritoError.textContent = `La cantidad solicitada (${cantidad}) excede el stock disponible (${p.cantidad}).`;
      return;
    }
    const userEmail = getUserEmail();
    const exito = agregarAlCarrito(userEmail, p.nombre, cantidad);
    if (exito) {
      alert(`¡${cantidad} unidad(es) de ${p.nombre} añadida(s) al carrito!`);
      cerrarModal();
      if (document.getElementById("perfil").classList.contains("active")) {
        mostrarPerfilEnPantalla(); // Actualizar ícono del carrito
      }
    } else {
      carritoError.textContent = "No se pudo añadir al carrito. Verifica el stock.";
    }
  });

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());

  // Contenedor donde se inyectará el formulario de pedido
  const orderFormContainer = document.createElement("div");
  orderFormContainer.id = "orderFormContainer";

  // Armamos el contenido
  contenido.append(h2, vendedor, elab, desc, precio, stock, pago);
  contenido.append(starsContainer, labelCantidadCarrito, inputCantidadCarrito, carritoError);
  contenido.append(botonPedido, botonCarrito, botonCerrar, orderFormContainer);
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
 * @param {Object} p 
 */
function mostrarOrderForm(p) {
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
  inputCantidad.max = p.cantidad; // Limita la cantidad al stock disponible
  inputCantidad.required = true;

  // Mensaje de error para validación de stock
  const stockError = document.createElement("p");
  stockError.id = "stockError";
  stockError.className = "stock-error";
  stockError.style.color = "red";

  // Validación en tiempo real para la cantidad
  inputCantidad.addEventListener("input", () => {
    const cantidad = parseInt(inputCantidad.value, 10);
    if (cantidad > p.cantidad) {
      stockError.textContent = `La cantidad solicitada (${cantidad}) excede el stock disponible (${p.cantidad}).`;
      inputCantidad.setCustomValidity("Cantidad inválida");
    } else {
      stockError.textContent = "";
      inputCantidad.setCustomValidity("");
    }
  });

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
    stockError,
    labelDetalle, textareaDetalle,
    labelPago, selectPago,
    botonGuardar
  );

  // Al enviar el form, valida el stock antes de procesar
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const cantidadSolicitada = parseInt(inputCantidad.value, 10);
    if (cantidadSolicitada > p.cantidad) {
      stockError.textContent = `La cantidad solicitada (${cantidadSolicitada}) excede el stock disponible (${p.cantidad}).`;
      return;
    }
    const datosPedido = {
      cliente: inputCliente.value.trim(),
      telefono: inputTelefono.value.trim(),
      direccion: inputDireccion.value.trim(),
      detalle: textareaDetalle.value.trim(),
      metodoPago: selectPago.value
    };
    const exito = procesarPedido(p.nombre, cantidadSolicitada, datosPedido);
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
 * Muestra un modal con un formulario prellenado para editar un producto.
 * @param {Object} p - Objeto producto
 */
function mostrarFormularioEditarProducto(p) {
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
  h2.textContent = `Editar Producto: ${p.nombre}`;

  // Formulario de edición
  const form = document.createElement("form");
  form.id = "editProductForm";
  form.className = "order-form";

  // Nombre
  const labelNombre = document.createElement("label");
  labelNombre.setAttribute("for", "editNombreProducto");
  labelNombre.textContent = "Nombre del Producto:";
  const inputNombre = document.createElement("input");
  inputNombre.type = "text";
  inputNombre.id = "editNombreProducto";
  inputNombre.value = p.nombre;
  inputNombre.required = true;

  // Descripción
  const labelDesc = document.createElement("label");
  labelDesc.setAttribute("for", "editDescripcionProducto");
  labelDesc.textContent = "Descripción:";
  const textareaDesc = document.createElement("textarea");
  textareaDesc.id = "editDescripcionProducto";
  textareaDesc.value = p.descripcion;
  textareaDesc.required = true;

  // Elaboración
  const labelElab = document.createElement("label");
  labelElab.setAttribute("for", "editElaboracionProducto");
  labelElab.textContent = "Cómo se elabora:";
  const textareaElab = document.createElement("textarea");
  textareaElab.id = "editElaboracionProducto";
  textareaElab.value = p.elaboracion;
  textareaElab.required = true;

  // Precio
  const labelPrecio = document.createElement("label");
  labelPrecio.setAttribute("for", "editPrecioProducto");
  labelPrecio.textContent = "Precio:";
  const inputPrecio = document.createElement("input");
  inputPrecio.type = "number";
  inputPrecio.id = "editPrecioProducto";
  inputPrecio.value = p.precio;
  inputPrecio.required = true;

  // Cantidad
  const labelCantidad = document.createElement("label");
  labelCantidad.setAttribute("for", "editCantidadProducto");
  labelCantidad.textContent = "Cantidad Disponible:";
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.id = "editCantidadProducto";
  inputCantidad.value = p.cantidad;
  inputCantidad.required = true;

  // Vendedor
  const labelVendedor = document.createElement("label");
  labelVendedor.setAttribute("for", "editVendedorProducto");
  labelVendedor.textContent = "Vendedor o Empresa:";
  const inputVendedor = document.createElement("input");
  inputVendedor.type = "text";
  inputVendedor.id = "editVendedorProducto";
  inputVendedor.value = p.vendedor;
  inputVendedor.required = true;

  // Medios de Pago
  const labelPago = document.createElement("label");
  labelPago.setAttribute("for", "editPagoProducto");
  labelPago.textContent = "Medios de Pago:";
  const inputPago = document.createElement("input");
  inputPago.type = "text";
  inputPago.id = "editPagoProducto";
  inputPago.value = p.pago;
  inputPago.required = true;

  // Categoría
  const labelCategoria = document.createElement("label");
  labelCategoria.setAttribute("for", "editCategoriaProducto");
  labelCategoria.textContent = "Categoría:";
  const selectCategoria = document.createElement("select");
  selectCategoria.id = "editCategoriaProducto";
  selectCategoria.required = true;
  ["comida", "ropa", "artesanias"].forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === p.categoria) option.selected = true;
    selectCategoria.appendChild(option);
  });

  // Imagen
  const labelImagen = document.createElement("label");
  labelImagen.setAttribute("for", "editImagenProducto");
  labelImagen.textContent = "Imagen del producto:";
  const inputImagen = document.createElement("input");
  inputImagen.type = "file";
  inputImagen.id = "editImagenProducto";
  inputImagen.accept = "image/*";

  // Mensaje de error
  const errorP = document.createElement("p");
  errorP.id = "editProductFormError";
  errorP.style.color = "red";

  // Botón Guardar
  const botonGuardar = document.createElement("button");
  botonGuardar.type = "submit";
  botonGuardar.className = "order-btn";
  botonGuardar.textContent = "Guardar Cambios";

  // Botón Cerrar
  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());

  // Agregar elementos al formulario
  form.append(
    labelNombre, inputNombre,
    labelDesc, textareaDesc,
    labelElab, textareaElab,
    labelPrecio, inputPrecio,
    labelCantidad, inputCantidad,
    labelVendedor, inputVendedor,
    labelPago, inputPago,
    labelCategoria, selectCategoria,
    labelImagen, inputImagen,
    errorP,
    botonGuardar,
    botonCerrar
  );

  // Manejar el envío del formulario
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const nuevosDatos = {
      nombre: inputNombre.value.trim(),
      descripcion: textareaDesc.value.trim(),
      elaboracion: textareaElab.value.trim(),
      precio: Number(inputPrecio.value),
      cantidad: Number(inputCantidad.value),
      vendedor: inputVendedor.value.trim(),
      pago: inputPago.value.trim(),
      categoria: selectCategoria.value,
      empresaDescripcion: "Registrado por usuario" // Mantener el valor por defecto
    };

    // Validaciones básicas
    if (!nuevosDatos.nombre || !nuevosDatos.descripcion || !nuevosDatos.elaboracion ||
        nuevosDatos.precio <= 0 || nuevosDatos.cantidad <= 0 ||
        !nuevosDatos.vendedor || !nuevosDatos.pago) {
      errorP.textContent = "Por favor completa todos los campos correctamente.";
      return;
    }

    // Verificar duplicado de nombre (excluyendo el producto actual)
    const todos = obtenerProductos();
    const existe = todos.some(p2 => p2.nombre.toLowerCase() === nuevosDatos.nombre.toLowerCase() && p2.nombre !== p.nombre);
    if (existe) {
      errorP.textContent = "Ya existe un producto con ese nombre.";
      return;
    }

    // Manejar la imagen
    const fileInput = inputImagen;
    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        nuevosDatos.image = reader.result;
        const exito = editarProducto(p.nombre, nuevosDatos);
        if (exito) {
          alert("¡Producto actualizado!");
          cerrarModal();
          mostrarPerfilEnPantalla();
          recargarVistaProductos();
        } else {
          errorP.textContent = "Error al actualizar el producto.";
        }
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      // Si no se subió una nueva imagen, mantener la imagen existente
      nuevosDatos.image = p.image;
      const exito = editarProducto(p.nombre, nuevosDatos);
      if (exito) {
        alert("¡Producto actualizado!");
        cerrarModal();
        mostrarPerfilEnPantalla();
        recargarVistaProductos();
      } else {
        errorP.textContent = "Error al actualizar el producto.";
      }
    }
  });

  // Agregar al modal
  contenido.append(h2, form);
  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // Enfocar el primer input
  inputNombre.focus();
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

  // Limpiar sección primero
  perfilSec.innerHTML = "";

  // Contenedor para el ícono de notificaciones, favoritos y carrito
  const topContainer = document.createElement("div");
  topContainer.className = "top-container";

  // Ícono de notificaciones
  const notificationContainer = document.createElement("div");
  notificationContainer.className = "notification-container";
  const notificacionesNoLeidas = obtenerNotificacionesNoLeidas(userEmail);
  notificationContainer.innerHTML = `
    <span id="notification-icon" style="cursor: pointer;">🔔${notificacionesNoLeidas > 0 ? `<span class="notification-count">${notificacionesNoLeidas}</span>` : ""}</span>
  `;

  // Ícono de favoritos
  const favoritesContainer = document.createElement("div");
  favoritesContainer.className = "favorites-container";
  favoritesContainer.innerHTML = `
    <span id="favorites-icon" style="cursor: pointer;">♥</span>
  `;

  // Ícono de carrito
  const carritoContainer = document.createElement("div");
  carritoContainer.className = "notification-container"; // Reutilizamos la clase para consistencia
  const carritoItems = obtenerCarrito(userEmail);
  const totalItems = carritoItems.reduce((sum, item) => sum + item.cantidad, 0);
  carritoContainer.innerHTML = `
    <span id="carrito-icon" style="cursor: pointer;">🛒${totalItems > 0 ? `<span class="notification-count">${totalItems}</span>` : ""}</span>
  `;

  topContainer.append(notificationContainer, favoritesContainer, carritoContainer);
  perfilSec.appendChild(topContainer);

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
      // Agregar botón "Editar" solo para productos propios
      const botonEditar = document.createElement("button");
      botonEditar.className = "order-btn";
      botonEditar.textContent = "Editar";
      botonEditar.addEventListener("click", (e) => {
        e.stopPropagation(); // Evitar que se abra el modal de detalles
        mostrarFormularioEditarProducto(p);
      });
      card.querySelector(".info").appendChild(botonEditar);
      productosCont.appendChild(card);
    });
  } else {
    productosCont.innerHTML += `<p>Aún no has creado ningún producto.</p>`;
  }
  perfilSec.appendChild(productosCont);

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

    // Construimos el objeto producto
    const productoNuevo = {
      nombre: nombreProd,
      descripcion,
      elaboracion,
      precio,
      cantidad,
      vendedor,
      pago,
      categoria,
      empresaExclusion: "Registrado por usuario",
      rating: [],
      image: null,
      creatorEmail: getUserEmail()  // para saber quién lo creó
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

  // Listener para el ícono de notificaciones
  const notificationIcon = document.getElementById("notification-icon");
  if (notificationIcon) {
    notificationIcon.addEventListener("click", () => {
      mostrarNotificacionesDropdown();
    });
  }

  // Listener para el ícono de favoritos
  const favoritesIcon = document.getElementById("favorites-icon");
  if (favoritesIcon) {
    favoritesIcon.addEventListener("click", () => {
      mostrarFavoritosDropdown();
    });
  }

  // Listener para el ícono de carrito
  const carritoIcon = document.getElementById("carrito-icon");
  if (carritoIcon) {
    carritoIcon.addEventListener("click", () => {
      mostrarCarritoDropdown();
    });
  }
}

/**
 * Muestra las notificaciones en un modal
 */
function mostrarNotificacionesDropdown() {
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
  h2.textContent = "Notificaciones";

  contenido.appendChild(h2);

  const userEmail = getUserEmail();
  const notifs = obtenerNotificaciones(userEmail);

  // Marcar todas las notificaciones como leídas al abrir el modal
  if (userEmail && notifs.length > 0) {
    notifs.forEach((n, index) => {
      if (!n.leida) {
        marcarNotificacionLeida(userEmail, index);
      }
    });
  }

  if (!userEmail) {
    const p = document.createElement("p");
    p.className = "notification-card";
    p.textContent = "Debes iniciar sesión para ver tus notificaciones.";
    contenido.appendChild(p);
  } else if (notifs.length > 0) {
    notifs.forEach((n, index) => {
      const div = document.createElement("div");
      div.className = "notification-card";
      const infoDiv = document.createElement("div");
      infoDiv.className = "notification-info";
      infoDiv.innerHTML = `
        <p><strong>Producto:</strong> ${n.producto}</p>
        <p><strong>Cantidad:</strong> ${n.cantidad}</p>
        <p><strong>Comprador:</strong> ${n.comprador}</p>
        <p><strong>Cliente:</strong> ${n.cliente}</p>
        <p><strong>Teléfono:</strong> ${n.telefono}</p>
        <p><strong>Dirección:</strong> ${n.direccion}</p>
        <p><strong>Detalle:</strong> ${n.detalle || "Sin detalle"}</p>
        <p><strong>Método de Pago:</strong> ${n.metodoPago}</p>
        <p><strong>Fecha:</strong> ${new Date(n.fecha).toLocaleString()}</p>
      `;
      const buttonDiv = document.createElement("div");
      buttonDiv.className = "notification-actions";
      const deleteButton = document.createElement("button");
      deleteButton.className = "order-btn delete-notification";
      deleteButton.setAttribute("data-index", index);
      deleteButton.textContent = "Eliminar";
      buttonDiv.appendChild(deleteButton);
      div.appendChild(infoDiv);
      div.appendChild(buttonDiv);

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarModal(); // Cerrar el modal actual
        mostrarOrderForm(obtenerProductos().find(p => p.nombre === n.producto));
      });
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.target.getAttribute("data-index"), 10);
        eliminarNotificacion(userEmail, idx);
        cerrarModal();
        mostrarPerfilEnPantalla(); // Recargar vista de perfil
        mostrarNotificacionesDropdown(); // Reabrir el modal con notificaciones actualizadas
      });
      contenido.appendChild(div);
    });
  } else {
    const p = document.createElement("p");
    p.className = "notification-card";
    p.textContent = "No tienes nuevas notificaciones.";
    contenido.appendChild(p);
  }

  // Botón Cerrar
  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());
  contenido.appendChild(botonCerrar);

  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // Enfocar el botón Cerrar
  botonCerrar.focus();
}

/**
 * Muestra los productos favoritos en un modal
 */
function mostrarFavoritosDropdown() {
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
  h2.textContent = "Mis Favoritos";

  contenido.appendChild(h2);

  const userEmail = getUserEmail();
  const favoritos = obtenerFavoritos(userEmail);
  const listaAll = obtenerProductos();

  if (!userEmail) {
    const p = document.createElement("p");
    p.className = "notification-card";
    p.textContent = "Debes iniciar sesión para ver tus favoritos.";
    contenido.appendChild(p);
  } else if (favoritos.length > 0) {
    favoritos.forEach(nombre => {
      const p = listaAll.find(prod => prod.nombre === nombre);
      if (p) {
        const div = document.createElement("div");
        div.className = "notification-card";
        div.innerHTML = `
          <div class="image-container">
            <img src="${p.image || 'assets/placeholder.png'}" alt="${p.image ? p.nombre : 'sin imagen'}">
          </div>
          <div class="info">
            <h2 class="product-title">${p.nombre}</h2>
            <p><strong>Vendedor:</strong> ${p.vendedor}</p>
            <p><strong>Descripción:</strong> ${p.descripcion}</p>
          </div>
        `;
        div.addEventListener("click", (e) => {
          e.stopPropagation();
          cerrarModal();
          mostrarModalDetalles(p);
        });
        contenido.appendChild(div);
      }
    });
  } else {
    const p = document.createElement("p");
    p.className = "notification-card";
    p.textContent = "No tienes productos favoritos.";
    contenido.appendChild(p);
  }

  // Botón Cerrar
  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());
  contenido.appendChild(botonCerrar);

  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // Enfocar el botón Cerrar
  botonCerrar.focus();
}

/**
 * Muestra el carrito de compras en un modal
 */
function mostrarCarritoDropdown() {
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
  h2.textContent = "Carrito de Compras";

  contenido.appendChild(h2);

  const userEmail = getUserEmail();
  const carrito = obtenerCarrito(userEmail);
  const productos = obtenerProductos();
  let totalCarrito = 0;

  if (carrito.length === 0) {
    const p = document.createElement("p");
    p.className = "notification-card";
    p.textContent = "Tu carrito está vacío.";
    contenido.appendChild(p);
  } else {
    carrito.forEach((item, index) => {
      const producto = productos.find(p => p.nombre === item.producto);
      if (producto) {
        const subtotal = producto.precio * item.cantidad;
        totalCarrito += subtotal;

        const div = document.createElement("div");
        div.className = "notification-card";
        const infoDiv = document.createElement("div");
        infoDiv.className = "notification-info";
        infoDiv.innerHTML = `
          <p><strong>Producto:</strong> ${producto.nombre}</p>
          <p><strong>Precio Unitario:</strong> $${producto.precio}</p>
          <p><strong>Cantidad:</strong> ${item.cantidad}</p>
          <p><strong>Subtotal:</strong> $${subtotal}</p>
        `;

        const buttonDiv = document.createElement("div");
        buttonDiv.className = "notification-actions";

        // Botones para modificar cantidad
        const btnMenos = document.createElement("button");
        btnMenos.className = "carrito-cantidad-btn";
        btnMenos.textContent = "-";
        btnMenos.addEventListener("click", (e) => {
          e.stopPropagation();
          const nuevaCantidad = item.cantidad - 1;
          if (nuevaCantidad >= 1) {
            actualizarCantidadCarrito(userEmail, item.producto, nuevaCantidad);
            cerrarModal();
            mostrarCarritoDropdown();
            mostrarPerfilEnPantalla(); // Actualizar contador
          }
        });

        const btnMas = document.createElement("button");
        btnMas.className = "carrito-cantidad-btn";
        btnMas.textContent = "+";
        btnMas.addEventListener("click", (e) => {
          e.stopPropagation();
          const nuevaCantidad = item.cantidad + 1;
          const exito = actualizarCantidadCarrito(userEmail, item.producto, nuevaCantidad);
          if (exito) {
            cerrarModal();
            mostrarCarritoDropdown();
            mostrarPerfilEnPantalla(); // Actualizar contador
          } else {
            alert("No hay suficiente stock para aumentar la cantidad.");
          }
        });

        // Botón eliminar
        const deleteButton = document.createElement("button");
        deleteButton.className = "order-btn delete-carrito";
        deleteButton.setAttribute("data-index", index);
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation();
          eliminarDelCarrito(userEmail, item.producto);
          cerrarModal();
          mostrarCarritoDropdown();
          mostrarPerfilEnPantalla(); // Actualizar contador
        });

        buttonDiv.append(btnMenos, btnMas, deleteButton);
        div.appendChild(infoDiv);
        div.appendChild(buttonDiv);
        contenido.appendChild(div);
      }
    });

    // Mostrar total del carrito
    const totalDiv = document.createElement("div");
    totalDiv.className = "carrito-total";
    totalDiv.textContent = `Total: $${totalCarrito}`;
    contenido.appendChild(totalDiv);

    // Botón para finalizar compra
    const btnFinalizar = document.createElement("button");
    btnFinalizar.className = "order-btn";
    btnFinalizar.textContent = "Finalizar Compra";
    btnFinalizar.addEventListener("click", () => {
      const formContainer = document.createElement("div");
      formContainer.id = "carritoFormContainer";
      contenido.appendChild(formContainer);
      mostrarFormularioFinalizarCompra(formContainer, userEmail);
    });
    contenido.appendChild(btnFinalizar);
  }

  // Botón Cerrar
  const botonCerrar = document.createElement("button");
  botonCerrar.className = "order-btn";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => cerrarModal());
  contenido.appendChild(botonCerrar);

  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // Enfocar el botón Cerrar
  botonCerrar.focus();
}

/**
 * Muestra el formulario para finalizar la compra del carrito
 * @param {HTMLElement} cont - Contenedor donde se inyectará el formulario
 * @param {string|null} userEmail - Email del usuario o null para invitado
 */
function mostrarFormularioFinalizarCompra(cont, userEmail) {
  cont.innerHTML = "";

  const form = document.createElement("form");
  form.className = "order-form";

  // Nombre Cliente
  const labelCliente = document.createElement("label");
  labelCliente.setAttribute("for", "clienteCarrito");
  labelCliente.textContent = "Nombre Cliente:";
  const inputCliente = document.createElement("input");
  inputCliente.type = "text";
  inputCliente.id = "clienteCarrito";
  inputCliente.name = "cliente";
  inputCliente.required = true;

  // Teléfono
  const labelTelefono = document.createElement("label");
  labelTelefono.setAttribute("for", "telefonoCarrito");
  labelTelefono.textContent = "Número de Celular:";
  const inputTelefono = document.createElement("input");
  inputTelefono.type = "tel";
  inputTelefono.id = "telefonoCarrito";
  inputTelefono.name = "telefono";
  inputTelefono.required = true;

  // Dirección
  const labelDireccion = document.createElement("label");
  labelDireccion.setAttribute("for", "direccionCarrito");
  labelDireccion.textContent = "Dirección:";
  const inputDireccion = document.createElement("input");
  inputDireccion.type = "text";
  inputDireccion.id = "direccionCarrito";
  inputDireccion.name = "direccion";
  inputDireccion.required = true;

  // Detalle Pedido
  const labelDetalle = document.createElement("label");
  labelDetalle.setAttribute("for", "detalleCarrito");
  labelDetalle.textContent = "Detalle Pedido:";
  const textareaDetalle = document.createElement("textarea");
  textareaDetalle.id = "detalleCarrito";
  textareaDetalle.name = "detalle";

  // Método de Pago
  const labelPago = document.createElement("label");
  labelPago.setAttribute("for", "metodoPagoCarrito");
  labelPago.textContent = "Método de Pago:";
  const selectPago = document.createElement("select");
  selectPago.id = "metodoPagoCarrito";
  selectPago.name = "metodoPago";
  ["Transferencia Nequi", "Transferencia Daviplata", "Bancolombia", "PSE", "Débito/Crédito"]
    .forEach(opt => {
      const o = document.createElement("option");
      o.textContent = opt;
      selectPago.appendChild(o);
    });

  // Mensaje de error
  const stockError = document.createElement("p");
  stockError.id = "carritoStockError";
  stockError.className = "stock-error";
  stockError.style.color = "red";

  // Botón Guardar Pedido
  const botonGuardar = document.createElement("button");
  botonGuardar.type = "submit";
  botonGuardar.className = "order-btn";
  botonGuardar.textContent = "Confirmar Compra";

  // Agregar todos los inputs al form
  form.append(
    labelCliente, inputCliente,
    labelTelefono, inputTelefono,
    labelDireccion, inputDireccion,
    labelDetalle, textareaDetalle,
    labelPago, selectPago,
    stockError,
    botonGuardar
  );

  // Al enviar el form, procesar todos los ítems del carrito
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const datosPedido = {
      cliente: inputCliente.value.trim(),
      telefono: inputTelefono.value.trim(),
      direccion: inputDireccion.value.trim(),
      detalle: textareaDetalle.value.trim(),
      metodoPago: selectPago.value
    };

    const exito = finalizarCompraCarrito(userEmail, datosPedido);
    cont.innerHTML = ""; // Borrar el formulario
    const resDiv = document.createElement("div");
    if (exito) {
      resDiv.className = "order-result success";
      resDiv.innerHTML = `<div class="icon">✓</div>Compra Exitosa`;
      recargarVistaProductos();
      mostrarPerfilEnPantalla(); // Actualizar contador
    } else {
      resDiv.className = "order-result failure";
      resDiv.innerHTML = `<div class="icon">✖</div>Compra Fallida. Verifica el stock.`;
    }
    cont.appendChild(resDiv);
  });

  cont.appendChild(form);
}