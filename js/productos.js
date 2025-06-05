// js/productos.js

/**
 * Clave de almacenamiento de NOTIFICACIONES
 * Estructura en localStorage (key = NOTIF_KEY):
 * {
 *   "emailUsuario1": [ { producto, cantidad, comprador, fecha, cliente, telefono, direccion, detalle, metodoPago, leida }, ... ],
 *   "emailUsuario2": [ ... ],
 *   ...
 * }
 */
const NOTIF_KEY = "notifications";

/**
 * —– NUEVO: Clave de almacenamiento de FAVORITOS
 * Estructura en localStorage (key = FAVORITES_KEY):
 * {
 *   "emailUsuario1": [ "nombreProducto1", "nombreProducto2", ... ],
 *   "emailUsuario2": [ ... ],
 *   ...
 * }
 */
const FAVORITES_KEY = "favorites";

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
        metodoPago: datosPedido.metodoPago,
        leida: false // —– NUEVO: Marcar notificación como no leída
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

/**
 * —– NUEVO: Agrega un producto a la lista de favoritos de un usuario.
 * @param {string} emailUsuario - Email del usuario
 * @param {string} nombreProducto - Nombre del producto a agregar
 * @returns {boolean} - true si se agregó, false si ya estaba en favoritos
 */
function agregarFavorito(emailUsuario, nombreProducto) {
  const favoritos = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  const listaFavoritos = favoritos[emailUsuario] || [];
  if (listaFavoritos.includes(nombreProducto)) {
    return false; // Ya está en favoritos
  }
  listaFavoritos.push(nombreProducto);
  favoritos[emailUsuario] = listaFavoritos;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritos));
  return true;
}

/**
 * —– NUEVO: Elimina un producto de la lista de favoritos de un usuario.
 * @param {string} emailUsuario - Email del usuario
 * @param {string} nombreProducto - Nombre del producto a eliminar
 * @returns {boolean} - true si se eliminó, false si no estaba en favoritos
 */
function eliminarFavorito(emailUsuario, nombreProducto) {
  const favoritos = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  const listaFavoritos = favoritos[emailUsuario] || [];
  const index = listaFavoritos.indexOf(nombreProducto);
  if (index === -1) {
    return false; // No está en favoritos
  }
  listaFavoritos.splice(index, 1);
  favoritos[emailUsuario] = listaFavoritos;
  if (listaFavoritos.length === 0) {
    delete favoritos[emailUsuario]; // Eliminar la clave si no hay favoritos
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritos));
  return true;
}

/**
 * —– NUEVO: Obtiene la lista de nombres de productos favoritos de un usuario.
 * @param {string} emailUsuario - Email del usuario
 * @returns {Array} - Lista de nombres de productos favoritos
 */
function obtenerFavoritos(emailUsuario) {
  const favoritos = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  return favoritos[emailUsuario] || [];
}

/**
 * —– NUEVO: Marca una notificación como leída
 * @param {string} emailUsuario - Email del usuario
 * @param {number} index - Índice de la notificación a marcar
 */
function marcarNotificacionLeida(emailUsuario, index) {
  const todasNotifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {};
  const notifsUsuario = todasNotifs[emailUsuario] || [];
  if (index >= 0 && index < notifsUsuario.length) {
    notifsUsuario[index].leida = true;
    todasNotifs[emailUsuario] = notifsUsuario;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(todasNotifs));
  }
}

/**
 * —– NUEVO: Obtiene el número de notificaciones no leídas de un usuario
 * @param {string} emailUsuario - Email del usuario
 * @returns {number} - Cantidad de notificaciones no leídas
 */
function obtenerNotificacionesNoLeidas(emailUsuario) {
  const notifs = obtenerNotificaciones(emailUsuario);
  return notifs.filter(n => !n.leida).length;
}
