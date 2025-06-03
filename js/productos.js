// js/productos.js

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
 * Retorna true si se logró restar (pedido exitoso), false si no había stock suficiente.
 * @param {string} nombre 
 * @param {number} cantidad 
 * @returns {boolean}
 */
function procesarPedido(nombre, cantidad) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.nombre === nombre);
  if (idx > -1 && productos[idx].cantidad >= cantidad) {
    productos[idx].cantidad -= cantidad;
    guardarProductos(productos);
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
