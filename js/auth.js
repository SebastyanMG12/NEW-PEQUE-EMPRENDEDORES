// js/auth.js

// Usuarios por defecto
const usuarios = [
  { nombre: "Emprendedor1", email: "user1@peque.com", password: "1234" },
  { nombre: "Emprendedor2", email: "user2@peque.com", password: "abcd" },
  { nombre: "Emprendedor3", email: "user3@peque.com", password: "pass" }
];

/**
 * Verifica si existe un usuario con email y contraseña.
 * Si es correcto, guarda nombre y email en localStorage.
 * @param {string} email 
 * @param {string} pass 
 * @returns {boolean} true si autenticación exitosa; false en otro caso.
 */
function autenticarUsuario(email, pass) {
  const u = usuarios.find(u => u.email === email && u.password === pass);
  if (u) {
    localStorage.setItem("userName", u.nombre);
    localStorage.setItem("userEmail", u.email);
    return true;
  }
  return false;
}

/**
 * Cierra sesión: elimina datos de usuario de localStorage.
 */
function logout() {
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

/**
 * Retorna el nombre del usuario logueado (o null si no hay ninguno).
 * @returns {string|null}
 */
function getUserName() {
  return localStorage.getItem("userName");
}

/**
 * Retorna el email del usuario logueado (o null si no hay ninguno).
 * @returns {string|null}
 */
function getUserEmail() {
  return localStorage.getItem("userEmail");
}
