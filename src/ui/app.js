const {
    ipcRenderer
} = require('electron');
const main = require('../main');  

const producForm = document.getElementById('registro-form');
const productName = document.getElementById('nombre');
const tipo = document.getElementById('tipo');
const precio = document.getElementById('precio');
const buscador = document.getElementById('buscadorP')





const UsuarioActual = localStorage.getItem('usuarioActual') 

console.log(UsuarioActual)

let editingStatus = false;
let editProductId = ''


let products = [];



producForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProduct = {
        nombre: productName.value,
        tipo_unidad: tipo.value,
        precio: precio.value,
    };

    if (editingStatus == false) {

        ipcRenderer.send('datos-formulario', newProduct);

        // window.location.href = './Productos.html'


        getProducts()


    } else {

        await main.updateProduct(editProductId, newProduct);
        editingStatus = false
        editProductId = ''

    }

    producForm.reset()
    productName.focus()

    await getProducts();




});



// Funcion para borrar el producto
async function deleteProduct(id) {

    if (UsuarioActual === 'administrador'){
        const response = confirm('Esta seguro de borrar este producto?')
        if (response) {
    
            const result = await main.deleteProduct(id)
            await getProducts();
            return result
    
        } else {
            return null
        }
    }
    else{
        alert('No tienes permitido borrar un producto')
    }
    
}


// Funcion para editar el producto

async function editProduct(id) {
    if(UsuarioActual === 'administrador'){
        const product = await main.getProductById(id)
        productName.value = product.nombre
        tipo.value = product.tipo
    
        precio.value = product.precio
        editProductId = product.id;
    
        editingStatus = true    
    }else{
        alert('No tienes los permisos para editar un producto')
    }
}



const renderProducts = (products) => {
    const listaProductos = document.querySelector('.lista-productos');
    listaProductos.innerHTML = "";

    products.forEach(product => {
        const li = document.createElement("li");
        li.innerHTML = `
            <p>${product.nombre}, ${product.tipo_unidad}:  $ ${product.precio.toLocaleString()}</p>
            <div class="acciones">
                <button class="editar-btn" onclick="editProduct('${product.id}')">
                    EDITAR
                </button>
                <button class="borrar-btn" onclick="deleteProduct('${product.id}')">
                    BORRAR
                </button>
            </div>
        `;
        listaProductos.appendChild(li);
    });


};





// Agregar evento de escucha al buscador
buscador.addEventListener('input', () => {
    const searchTerm = buscador.value.toLowerCase(); // Obtener el valor del buscador en minúsculas

    // Filtrar productos que coincidan con el término de búsqueda
    const filteredProducts = products.filter(product => {
        // Convertir los atributos relevantes del producto a minúsculas para una comparación sin distinción entre mayúsculas y minúsculas
        const productName = product.nombre.toLowerCase();
        const productType = product.tipo_unidad.toLowerCase();
        const productPrice = product.precio.toString().toLowerCase();

        // Verificar si el término de búsqueda coincide con el nombre, tipo o precio del producto
        return productName.includes(searchTerm) ||
            productType.includes(searchTerm) ||
            productPrice.includes(searchTerm);
    });

    // Renderizar los productos filtrados
    renderProducts(filteredProducts);
});



// Llama a renderProducts con la lista de productos obtenidos
const getProducts = async () => {
    products = await main.getProducts();
    renderProducts(products); 
}




getProducts()