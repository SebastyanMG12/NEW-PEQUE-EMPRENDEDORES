// js/productos.js

/**
 * Clave de almacenamiento de NOTIFICACIONES
 * Estructura en localStorage (key = NOTIF_KEY):
 * {
 *   "emailUsuario1": [ { producto, cantidad, comprador, fecha, cliente, telefono, direccion, detalle, metodoPago }, ... ],
 *   "emailUsuario2": [ ... ],
 *   ...
 * }
 */
const NOTIF_KEY = "notifications";

/**
 * Retorna el arreglo completo de productos desde localStorage.
 * @returns {Array} lista de objetos producto
 */
function obtenerProductos() {
  return JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
}

/**
 * Guarda el arreglo completo de productos en localStorage.
 * @param {Array} productos 
 */
function guardarProductos(productos) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(productos));
}

/**
 * Agrega un nuevo producto (objeto) al inicio del arreglo y lo guarda.
 * @param {Object} producto 
 */
function agregarProducto(producto) {
  const productos = obtenerProductos();
  productos.unshift(producto);
  guardarProductos(productos);
}

/**
 * Busca un producto por nombre y le agrega un rating (número del 1 al 5).
 * @param {string} nombre 
 * @param {number} rating 
 */
function calificarProducto(nombre, rating) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.nombre === nombre);
  if (idx > -1) {
    productos[idx].rating.push(rating);
    guardarProductos(productos);
  }
}

/**
 * Reduce la cantidad disponible de un producto al procesar un pedido.
 * Además, si el producto pertenece a un usuario (creatorEmail),
 * genera una notificación para ese usuario con datos del pedido.
 * Retorna true si se logró restar (pedido exitoso), false si no había stock suficiente.
 * @param {string} nombre 
 * @param {number} cantidad 
 * @param {Object} datosPedido - Incluye cliente, telefono, direccion, detalle, metodoPago
 * @returns {boolean}
 */
function procesarPedido(nombre, cantidad, datosPedido) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.nombre === nombre);
  if (idx > -1 && productos[idx].cantidad >= cantidad) {
    // Restar stock
    productos[idx].cantidad -= cantidad;
    guardarProductos(productos);

    // generar notificación con datos completos
    const ownerEmail = productos[idx].creatorEmail; // campo agregado al crear producto
    const comprador = localStorage.getItem("userName") || "Invitado";
    if (ownerEmail) {
      // obtener objeto completo de notificaciones (o {} si no existe)
      const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
      const notifsUsuario = todasNotifs[ownerEmail] || [];
      // agrego la notificación con datos completos
      notifsUsuario.push({
        producto: nombre,
        cantidad: cantidad,
        comprador: comprador,
        fecha: new Date().toISOString(),
        cliente: datosPedido.cliente,
        telefono: datosPedido.telefono,
        direccion: datosPedido.direccion,
        detalle: datosPedido.detalle || "",
        metodoPago: datosPedido.metodoPago
      });
      // guardo de vuelta
      todasNotifs[ownerEmail] = notifsUsuario;
      localStorage.setItem(NOTIF_KEY, JSON.stringify(todasNotifs));
    }

    return true;
  }
  return false;
}

/**
 * Filtra productos por categoría. Si val == "all", retorna todos.
 * @param {string} val 
 * @returns {Array}
 */
function filtrarPorCategoria(val) {
  const productos = obtenerProductos();
  if (val === "all") return productos;
  return productos.filter(p => p.categoria === val);
}

/** 
 * Función para obtener el arreglo de notificaciones de un usuario
 * @param {string} emailUsuario 
 * @returns {Array} lista de notificaciones (puede estar vacía)
 */
function obtenerNotificaciones(emailUsuario) {
  const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
  return todasNotifs[emailUsuario] || [];
}

/** 
 * ( opcional ) Si quisieras sobrescribir todo el objeto de notificaciones:
 * @param {Object} objNotifs 
 */
function guardarNotificaciones(objNotifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(objNotifs));
}

/**
 * Elimina una notificación específica de un usuario
 * @param {string} emailUsuario 
 * @param {number} index - Índice de la notificación a eliminar
 */
function eliminarNotificacion(emailUsuario, index) {
  const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
  const notifsUsuario = todasNotifs[emailUsuario] || [];
  if (index >= 0 && index < notifsUsuario.length) {
    notifsUsuario.splice(index, 1);
    todasNotifs[emailUsuario] = notifsUsuario;
    if (notifsUsuario.length === 0) {
      delete todasNotifs[emailUsuario]; // Eliminar la clave si no hay notificaciones
    }
    localStorage.setItem(NOTIF_KEY, JSON.stringify(todasNotifs));
  }
}

/**
 * —– NUEVO: Busca productos por término de búsqueda y categoría.
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} category - Categoría seleccionada ("all" o específica)
 * @returns {Array} Lista de productos filtrados
 */
function buscarProductos(searchTerm, category) {
  let productos = obtenerProductos();
  // Filtrar por categoría primero
  if (category !== "all") {
    productos = productos.filter(p => p.categoria === category);
  }
  // Si no hay término de búsqueda, retornar productos filtrados por categoría
  if (!searchTerm) {
    return productos;
  }
  // Filtrar por nombre o descripción (insensible a mayúsculas)
  const term = searchTerm.toLowerCase();
  return productos.filter(p => 
    p.nombre.toLowerCase().includes(term) || 
    p.descripcion.toLowerCase().includes(term)
  );
}

/**
 * —– NUEVO: Actualiza un producto existente en localStorage basado en su nombre.
 * @param {string} nombre - Nombre del producto a editar
 * @param {Object} nuevosDatos - Objeto con los nuevos datos del producto
 */
function editarProducto(nombre, nuevosDatos) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.nombre === nombre);
  if (idx > -1) {
    // Mantener rating, image y creatorEmail del producto original
    productos[idx] = {
      ...productos[idx], // Conserva propiedades no editadas
      nombre: nuevosDatos.nombre,
      descripcion: nuevosDatos.descripcion,
      elaboracion: nuevosDatos.elaboracion,
      precio: nuevosDatos.precio,
      cantidad: nuevosDatos.cantidad,
      vendedor: nuevosDatos.vendedor,
      pago: nuevosDatos.pago,
      categoria: nuevosDatos.categoria,
      empresaDescripcion: nuevosDatos.empresaDescripcion || productos[idx].empresaDescripcion
    };
    guardarProductos(productos);
    return true;
  }
  return false;
}