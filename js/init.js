// js/init.js

// Clave de almacenamiento de productos
const PRODUCT_KEY = "emprendimientos";

// Productos por defecto (3 por categoría)
// COMIDA, ROPA y ARTESANÍAS (total 9 objetos)
const defaultProducts = [
  // COMIDA
  {
    nombre: "Arepas Doña Rosa",
    descripcion: "Arepas artesanales hechas en casa",
    elaboracion: "Masa de maíz amarilla molida y cocida en budare artesanal.",
    precio: 3500,
    cantidad: 40,
    vendedor: "Doña Rosa",
    pago: "Nequi, Daviplata",
    empresaDescripcion: "Negocio familiar con tradición de más de 20 años",
    categoria: "comida"
  },
  {
    nombre: "Empanadas El Valle",
    descripcion: "Empanadas de diversos rellenos",
    elaboracion: "Relleno de carne, pollo o queso envuelto en masa y fritas al momento.",
    precio: 2500,
    cantidad: 50,
    vendedor: "Empanadas El Valle",
    pago: "Nequi, Contra entrega",
    empresaDescripcion: "Pequeño emprendimiento local",
    categoria: "comida"
  },
  {
    nombre: "Jugos Naturales Uba",
    descripcion: "Jugos frescos preparados al momento",
    elaboracion: "Frutas locales licuadas y servidas sin azúcares añadidos.",
    precio: 3000,
    cantidad: 30,
    vendedor: "Jugos Naturales Uba",
    pago: "Daviplata, PSE",
    empresaDescripcion: "Bebidas saludables",
    categoria: "comida"
  },
  // ROPA
  {
    nombre: "Camiseta Artesanal",
    descripcion: "Camisetas con diseños bordados",
    elaboracion: "Tela de algodón con bordados hechos a mano.",
    precio: 45000,
    cantidad: 20,
    vendedor: "Bordados El Sol",
    pago: "Transferencia, Nequi",
    empresaDescripcion: "Marca de ropa	local",
    categoria: "ropa"
  },
  {
    nombre: "Bufandas Tejidas",
    descripcion: "Bufandas de lana tejidas a mano",
    elaboracion: "Hilo de lana natural tejido en diferentes patrones.",
    precio: 35000,
    cantidad: 15,
    vendedor: "Tejidos Ubaté",
    pago: "PSE, Contra entrega",
    empresaDescripcion: "Artesanía textil tradicional",
    categoria: "ropa"
  },
  {
    nombre: "Gorras Personalizadas",
    descripcion: "Gorras con logos variados",
    elaboracion: "Gorras de tela con estampados personalizados.",
    precio: 25000,
    cantidad: 25,
    vendedor: "Gorras Creativas",
    pago: "Tarjeta, Daviplata",
    empresaDescripcion: "Accesorios de moda local",
    categoria: "ropa"
  },
  // ARTESANÍAS
  {
    nombre: "Macetas de Barro",
    descripcion: "Macetas pintadas a mano",
    elaboracion: "Barro moldeado y pintado con diseños únicos.",
    precio: 20000,
    cantidad: 40,
    vendedor: "Arte en Barro",
    pago: "Nequi, PSE",
    empresaDescripcion: "Artesanía cerámica",
    categoria: "artesanias"
  },
  {
    nombre: "Figuritas Tejidas",
    descripcion: "Figuritas decorativas en crochet",
    elaboracion: "Crochet en hilo de algodón formando figuras pequeñas.",
    precio: 15000,
    cantidad: 60,
    vendedor: "Crochet Creativo",
    pago: "Daviplata, Contra entrega",
    empresaDescripcion: "Manualidades con hilo",
    categoria: "artesanias"
  },
  {
    nombre: "Cestería Tradicional",
    descripcion: "Cestas de materiales naturales",
    elaboracion: "Fibras naturales trenzadas con técnicas ancestrales.",
    precio: 50000,
    cantidad: 10,
    vendedor: "Cestería Ubaté",
    pago: "Transferencia",
    empresaDescripcion: "Técnicas ancestrales",
    categoria: "artesanias"
  }
];

/**
 * Inicializa en localStorage el arreglo de productos si no existe ninguno.
 */
function initDefault() {
  const stored = JSON.parse(localStorage.getItem(PRODUCT_KEY));
  if (!stored || stored.length === 0) {
    // Añadimos rating vacíos e image = null
    const withExtras = defaultProducts.map(p => ({ ...p, rating: [], image: null }));
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(withExtras));
  }
}
