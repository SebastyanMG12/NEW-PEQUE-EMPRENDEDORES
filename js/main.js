// js/main.js

// 1) Inicialización de datos (productos por defecto)
initDefault();     // de init.js

// 2) Cuando el DOM ya está cargado, mostramos productos y perfil
document.addEventListener("DOMContentLoaded", () => {
  recargarVistaProductos();       // muestra todos los productos en "Inicio"
  mostrarPerfilEnPantalla();      // muestra contenido en "Perfil" según si hay sesión
});

// 3) Event listeners para los enlaces del nav
document.getElementById("link-inicio").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("inicio");
});

document.getElementById("link-categorias").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("categorias");
});

document.getElementById("link-perfil").addEventListener("click", (e) => {
  e.preventDefault();
  mostrarPerfilEnPantalla();
  showSection("perfil");
});

document.getElementById("link-login").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("login");
});

document.getElementById("link-salir").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
  mostrarPerfilEnPantalla();
  showSection("inicio");
});

// 4) Listener para el submit de login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  const ok = autenticarUsuario(email, pass);
  const errP = document.getElementById("loginError");
  if (ok) {
    errP.textContent = "";
    mostrarPerfilEnPantalla();
    showSection("perfil");
  } else {
    errP.textContent = "Usuario o contraseña inválidos.";
  }
});

// 5) Listener para el filtro de categoría en la sección "Inicio"
document.getElementById("category").addEventListener("change", (e) => {
  const val = e.target.value;
  const filtrados = filtrarPorCategoria(val);
  renderProductos(filtrados);
});

// 6) Event listeners para hover en categorías
document.getElementById("card-comida").addEventListener("mouseover", () => {
  showCategoryItems("comida", "comidaList");
});
document.getElementById("card-comida").addEventListener("mouseout", () => {
  clearCategoryItems("comidaList");
});

document.getElementById("card-ropa").addEventListener("mouseover", () => {
  showCategoryItems("ropa", "ropaList");
});
document.getElementById("card-ropa").addEventListener("mouseout", () => {
  clearCategoryItems("ropaList");
});

document.getElementById("card-artesanias").addEventListener("mouseover", () => {
  showCategoryItems("artesanias", "artesaniasList");
});
document.getElementById("card-artesanias").addEventListener("mouseout", () => {
  clearCategoryItems("artesaniasList");
});
