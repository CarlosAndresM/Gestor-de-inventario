const {
    ipcRenderer
} = require('electron');


const main = require('../main'); // Importa main.js para acceder a getProducts


// Obtener elementos por su ID 
const nombreInventarioParrafo = document.getElementById('nombre');
const precioInventarioParrafo = document.getElementById('precio');
const cantidadActual = document.getElementById('cantidad-actual');
const cantidadForm = document.getElementById('registro-form');


const buscador = document.getElementById('buscadorP')



// Obtener referencia al botón de exportación
const botonExport = document.getElementById('exportButton');




// Obtener el ID y el Mes del inventario de la URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const mes = urlParams.get('mes')




// Agregar event listener para el evento 'click' al botón de exportación
botonExport.addEventListener('click', () => {
    ipcRenderer.send('export-to-excel', {
        id,
        mes
    }); // Envío de id y el mes al proceso principal 
});



let Products = []


// Invocar la función GetInv al cargar el contenido del documento
document.addEventListener("DOMContentLoaded", async () => {
    try {

        // Obtener el ID del inventario de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        await main.checkInventoryExists(id); // Verificar la existencia del inventario
        // Obtener e inicializar los productos del inventario específico


        document.getElementById('wifi-loader').style.display =
            'none'; // Ocultar la pantalla de carga
        document.getElementById('titulo-mes').innerText = mes; // Asignar el título del mes

        GetInv(id); // Obtener e inicializar los productos del inventario específico
    } catch (error) {
        console.error('Error al verificar el inventario:', error);
    }
});




// Agregar evento de escucha al buscador
buscador.addEventListener('input', async () => {
    const searchTerm = buscador.value.toLowerCase(); // Obtener el valor del buscador en minúsculas

    try {
        const productos = await main.getProductsInv(
            id); // Obtener los productos usando el ID del inventario

        // Filtrar productos que coincidan con el término de búsqueda
        const filteredProducts = productos.filter(product => {
            // Convertir los atributos relevantes del producto a minúsculas para una comparación sin distinción entre mayúsculas y minúsculas
            const productName = product.NombreP.toLowerCase();
            const productType = product.Tipo_unidad.toLowerCase();
            const productPrice = product.Precio.toString().toLowerCase();

            // Verificar si el término de búsqueda coincide con el nombre, tipo o precio del producto
            return productName.includes(searchTerm) ||
                productType.includes(searchTerm) ||
                productPrice.includes(searchTerm);
        });

        // Renderizar los productos filtrados
        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error al obtener y filtrar los productos:', error);
    }
});




// Función para renderizar los productos
async function renderProducts(productos) {
    try {
        const listaProductos = document.querySelector('.lista-productos');
        listaProductos.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

        // Verificar si productos es un array antes de intentar iterar sobre él
        if (Array.isArray(productos)) {
            productos.forEach(producto => {

                const precio = producto.Precio.toLocaleString()
                const li = document.createElement('li');
                li.innerHTML = `
            <p>${producto.NombreP}, Precio: ${precio}</p> 
            <div class="acciones">
                <button onclick="editarCantidad(${producto.id})">Registrar</button>
            </div>
        `;
                listaProductos.appendChild(
                    li); // Agregar el elemento de lista a la lista de productos
            });
        }
    } catch (error) {
        console.error('Error al renderizar los productos:', error);
    }
}



// Variables de estado para la edición de productos
let editingStatus = false;
let editProductId = '';

// Función para editar la cantidad del producto
async function editarCantidad(id) {
    try {
        console.log(id);
        // Obtener el producto del inventario por su ID
        const producto = await main.getProductsInvById(id);

        console.log(producto);

        if (!producto) {
            console.error('El producto no se encontró en el inventario.');
            return;
        } else {
            // Mostrar los datos del producto en el formulario de edición
            document.getElementById('nombreP').textContent = producto.NombreP;
            document.getElementById('precioP').textContent = producto.Precio.toLocaleString();
            document.getElementById('cantidad-actual').value = producto.Cantidad;
            document.getElementById('editar-cantidad').value = producto.Cantidad;
            document.getElementById('total-producto').textContent = 'Total Actual: ' + producto.Total.toLocaleString();

            // Establecer el estado de edición y el ID del producto
            editingStatus = true;
            editProductId = id;

            // Agregar evento al formulario de edición
            cantidadForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                try {
                    // Obtener el ID del inventario y el producto de la URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const idMes = urlParams.get('id');

                    // Obtener los valores del formulario y asignarles un valor predeterminado de cero si son nulos
                    const editarC = parseInt(document.getElementById('editar-cantidad')
                        .value) || 0;
                    const cantidad = parseInt(document.getElementById('cantidad-registrar')
                        .value) || 0;

                    // Calcular la nueva cantidad y el nuevo total
                    const nuevaCantidad = cantidad + editarC;
                    const nuevoTotal = producto.Precio * nuevaCantidad;

                    // Actualizar la cantidad y el total del producto en la base de datos
                    await main.updateProductQuantityAndTotal(idMes, editProductId,
                        nuevaCantidad, nuevoTotal);

                    // Limpiar los campos del formulario
                    document.getElementById('editar-cantidad').value = '';
                    document.getElementById('cantidad-registrar').value = '';
                    document.getElementById('nombreP').textContent = '';
                    document.getElementById('precioP').textContent = '';
                    document.getElementById('cantidad-actual').value = '';
                    document.getElementById('total-producto').textContent = '';

                    // Renderizar nuevamente la lista de productos
                    GetInv(idMes);

                    // Restablecer el estado de edición y el ID del producto
                    editingStatus = false;
                    editProductId = '';
                } catch (error) {
                    console.error('Error al procesar el formulario:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error al editar la cantidad del producto:', error);
    }
}

console.log('id del mes en el que estoy: ' + id)


// Asignar el Mes al título
document.getElementById('titulo-mes').innerText = mes;

// Manejar clic en "Terminar Inventario"
document.getElementById('terminar-inventario').addEventListener('click', async () => {
    try {
        // Lógica para terminar el inventario
        localStorage.setItem('mostrarBoton', 'true'); // Guarda la variable en true
        localStorage.setItem('inventarioCompletado', 'true');

        // Llamar a la función para actualizar la utilidad
        await main.updateUtility(id);

        // Redirige a la página de inventario
        window.location.href = 'inventario.html';
    } catch (error) {
        console.error('Error al terminar el inventario:', error);
    }
});




// Manejar clic en "Guardar Inventario"
document.getElementById('guardar-inventario').addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idMes = urlParams.get('id'); // Obtener el ID del inventario de los parámetros de la URL

    // Asignar el ID del inventario guardado
    localStorage.setItem('idGuardado', idMes);

    // Guardar el estado del inventario como guardado en el localStorage
    localStorage.setItem('inventarioGuardado', true);

    // Redirigir a la página de inventario con el ID guardado
    window.location.href = `inventario.html?id=${id}`;
});



// Función para obtener e inicializar los productos del inventario
const GetInv = async (inventoryId) => {
    try {
        const products = await main.getProductsInv(
            inventoryId); // Obtener los productos del inventario específico
        renderProducts(products); // Renderizar los productos obtenidos
    } catch (error) {
        console.error('Error al obtener e inicializar los productos:', error);
    }
}