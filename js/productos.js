// js/productos.js

/**
 * Clave de almacenamiento de NOTIFICACIONES
 * Estructura en localStorage (key = NOTIF_KEY):
 * {
 *   "emailUsuario1": [ { producto, cantidad, comprador, fecha }, ... ],
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
 * @returns {boolean}
 */
function procesarPedido(nombre, cantidad) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.nombre === nombre);
  if (idx > -1 && productos[idx].cantidad >= cantidad) {
    // Restar stock
    productos[idx].cantidad -= cantidad;
    guardarProductos(productos);

    // —– NUEVO: generar notificación para el "owner" del producto
    const ownerEmail = productos[idx].creatorEmail; // campo agregado al crear producto
    const comprador = localStorage.getItem("userName") || "Invitado";
    if (ownerEmail) {
      // obtener objeto completo de notificaciones (o {} si no existe)
      const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
      const notifsUsuario = todasNotifs[ownerEmail] || [];
      // agrego la notificación
      notifsUsuario.push({
        producto: nombre,
        cantidad: cantidad,
        comprador: comprador,
        fecha: new Date().toISOString()
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
 * —– NUEVO: Función para obtener el arreglo de notificaciones de un usuario
 * @param {string} emailUsuario 
 * @returns {Array} lista de notificaciones (puede estar vacía)
 */
function obtenerNotificaciones(emailUsuario) {
  const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
  return todasNotifs[emailUsuario] || [];
}

/** 
 * —– NUEVO: ( opcional ) Si quisieras sobrescribir todo el objeto de notificaciones:
 * @param {Object} objNotifs 
 */
function guardarNotificaciones(objNotifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(objNotifs));
}
