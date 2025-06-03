// js/categorias.js

/**
 * Muestra los nombres de productos de una categoría dentro del contenedor con id = idList.
 * @param {string} cat – nombre de categoría ("comida", "ropa" o "artesanias")
 * @param {string} idList – id del elemento <div> donde se inyectan los nombres
 */
function showCategoryItems(cat, idList) {
  const cont = document.getElementById(idList);
  cont.innerHTML = "";
  const productos = filtrarPorCategoria(cat);
  productos.forEach(p => {
    const item = document.createElement("div");
    item.textContent = p.nombre;
    cont.appendChild(item);
  });
}

/**
 * Limpia el contenido del contenedor con id = idList.
 * @param {string} idList 
 */
function clearCategoryItems(idList) {
  document.getElementById(idList).innerHTML = "";
}
