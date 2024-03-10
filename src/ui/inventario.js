const {
    ipcRenderer
} = require('electron');
const main = require('../main'); // Importa main.js para acceder a getProducts

const inventarioForm = document.getElementById('datos_mensuales');

// Obtener los valores de los campos del formulario
const mes = document.getElementById('Mes');
const cartera = document.getElementById('Cartera');
// const mercancia = document.getElementById('Mercancia'); // Campo de mercancía desactivado
const porRecoger = document.getElementById('Por_recoger');
const porPagar = document.getElementById('Por_pagar');
const efectivo = document.getElementById('Efectivo');
const utilidadAnterior = document.getElementById('utilidad_anterior');

const botonTrabajarInventario = document.querySelector('.trabajar-inventario');
const botonRegistrar = document.getElementById('boton-registrar');
const UsuarioActual = localStorage.getItem('usuarioActual')

let idInvGenerado = null; // Declarar idInvGenerado en el ámbito global

let editingStatus = false;

let editProductId = ''

/**
 * Función para debug del ID actual.
 * @param {any} id - El ID a registrar.
 */
function idActual(id) {
    console.log('Id actual: ' + id);
}



// Funcion para editar inventario

async function editInv(id) {

    if (UsuarioActual === 'administrador') {

        const inventario = await main.getInventoryById(id);
        mes.value = inventario.Mes;
        cartera.value = inventario.Cartera;
        porRecoger.value = inventario.PorRecoger;
        porPagar.value = inventario.PorPagar;
        efectivo.value = inventario.Efectivo;
        utilidadAnterior.value = inventario.UtilidadAnterior;
        editingStatus = true;
        editProductId = id; // Asigna el valor de id a editProductId
    } else {
        
        alert('No tienes permitido editar un inventario')
    }
 

}




// Función asincrónica que obtiene el ID del inventario recién creado
const updateInv = async (id, inv) => {
    try {
        const editfun = await main.updateInv(id, inv)
        return editfun // Retorna el ID del inventario recién creado        
    } catch (error) {
        console.error('Error al actualalizar el inventario:',
            error); // Manejo de error al obtener el inventario
        throw error;
    }
};



// Evento que se dispara cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', async function () {




    const inventarioCompletado = localStorage.getItem('inventarioCompletado');
    const inventarioGuardado = localStorage.getItem('inventarioGuardado');

    // Si el inventario no está completado validar si se activo el boton de registro 
    if (inventarioCompletado !== 'true') {
        const validarMostrar = localStorage.getItem('mostrarBoton');
        if (validarMostrar === 'true') {
            mostrarBoton(); // Muestra el botón de registro
            idInvGenerado = null; // Reinicia el ID del inventario generado para ser usado
        }

        // Si el inventario ha sido guardado previamente en el localStorage
        if (inventarioGuardado === 'true') {
            // Obtener el id guardado
            const id = localStorage.getItem('idGuardado');
            idInvGenerado = Number(id); // Convierte el ID guardado a un número


        }
    } else {

        // Restablecer el estado de inventarioCompletado a 'false' para permitir un nuevo inventario
        localStorage.setItem('inventarioCompletado', 'false');

        mostrarBoton()

        // Establecer idInvGenerado como nulo para permitir la selección de otro card
        idInvGenerado = null;

        // Limpia el localStorage si el inventario está completado
        localStorage.removeItem('inventarioGuardado');
        localStorage.removeItem('idGuardado');
    }

    idActual(idInvGenerado); // Llama a la función que hara debug con el id actual
});


// Funcion para borrar el inventario
const borrarInventario = async (id) => {
    try {


        const idActual  = localStorage.getItem('idGuardado');
        if(id == idActual ){
            alert('No puedes borrar el inventario que estas trabajando') 
        } else{
            if (UsuarioActual === 'administrador') {  

        
                // Preguntar al usuario si realmente desea borrar el inventario
                const confirmacion = confirm("¿Estás seguro de que deseas borrar este inventario?");
                if (confirmacion) {
                    // Preguntar al usuario si realmente desea borrar el inventario
                    const confirmacion2 = confirm(
                        "Debe tener en cuenta antes de borrar este inventario, exportar los datos.");
    
                    if (confirmacion2) {
                        const idInv = Number(id)
                        // Si el usuario confirma, proceder con la eliminación
                        const result = await main.deleteInventoryById(idInv);
                        console.log("Inventario eliminado con éxito");
                        window.location.reload();
                        return result;
                    } else {
                        console.log("La eliminación del inventario ha sido cancelada");
                    }
                } else {
                    console.log("La eliminación del inventario ha sido cancelada");
                }
            } else {
                alert('No tienes permitido borrar un inventario') 
                
            }
        }

    
    } catch (error) {
        console.log(error);
    }
}


 



// Función asincrónica para validar el inventario
async function validacionInventario(id) {
    try {

        // Convertir idInvGenerado a tipo Number
        let idInvGeneradoNumber = Number(idInvGenerado);
        let idNumber = Number(id);

        // Validar que los IDs no sean NaN, null o undefined
        if (!isNaN(idInvGeneradoNumber) && !isNaN(idNumber)) {
            // Verificar si el ID actual coincide con el ID seleccionado
            if (idInvGeneradoNumber === idNumber) {
                // Obtener el inventario por el ID
                const inventory = await main.getInventoryById(id);
                const resultId = inventory.id;
                const resultMe = inventory.Mes;

                // Ocultar el botón después de enviar el formulario
                botonRegistrar.style.display = 'none';
                botonRegistrar.disabled = true;

                // Guardar el estado del botón en el localStorage
                localStorage.setItem('botonOculto', 'true');

                // Redireccionar a la página de generación de inventario con parámetros
                window.location.href = `generacioInventario.html?id=${resultId}&mes=${resultMe}`;
            } else if (idInvGeneradoNumber == 0) {
                // Actualizar el ID de inventario si es 0
                idInvGenerado = idNumber;
                console.log(`ID de inventario actualizado a: ${idInvGenerado}`);
                validacionInventario(id);
            } else {
                console.log("No se permite cambiar el id hasta no terminar el proceso(inventario) actual.");
                console.log('Id actual: ' + idInvGeneradoNumber, ' seleccionaste el Id: ' + idNumber)


                // Obtener el inventario por el ID generado
                const inventory = await main.getInventoryById(idInvGeneradoNumber);
                const mesInventario = inventory.Mes;

                // Mostrar alerta indicando que es necesario finalizar el inventario actual
                alert(
                    `Debes finalizar el inventario ${mesInventario} para poder acceder a otro inventario`
                );
            }
        }
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
    }
}


document.getElementById('datos_mensuales').addEventListener('submit', function (event) {
    const form = event.target;
    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    }
    form.classList.add('was-validated');

});



// Lógica para manejar el envío del formulario de inventario
inventarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let n = 0;

    const NewInventario = {
        Mes: mes.value,
        Cartera: cartera.value,
        Mercancia: n,
        PorRecoger: porRecoger.value,
        PorPagar: porPagar.value,
        Efectivo: efectivo.value,
        UtilidadAnterior: utilidadAnterior.value,
        Utilidad: n
    };

    const editIventario = {
        Mes: mes.value,
        Cartera: cartera.value,
        PorRecoger: porRecoger.value,
        PorPagar: porPagar.value,
        Efectivo: efectivo.value,
        UtilidadAnterior: utilidadAnterior.value
    };


    if (editingStatus) { // Si está en modo edición, actualiza en lugar de registrar
        try {
            await updateInv(editProductId, editIventario);
            console.log('Inventario actualizado con éxito');
            editingStatus = false;
            editProductId = '';
        } catch (error) {
            console.error('Error al actualizar el inventario:', error);
            // Manejo de errores al actualizar el inventario
        }
    } else {
        try {
            ipcRenderer.send('datos-mensuales', NewInventario);
            console.log('Inventario enviado con éxito');
            botonRegistrar.style.display = 'none';
            botonRegistrar.disabled = true;
            localStorage.setItem('botonOculto', 'true');
        } catch (error) {
            console.error('Error al enviar el inventario:', error);
            // Manejo de errores al enviar el inventario
        }
    }

    // let newInventoryId = await getInv();

    getItems();
    const inventory = await main.getInventory(); // Obtiene el inventario desde main.js
    let newInventoryId = inventory[0].id;
    console.log(newInventoryId);

    idInvGenerado = Number(newInventoryId);

    // Guardar el ID del nuevo inventario en localStorage
    localStorage.setItem('idGuardado', idInvGenerado);

    // Marcar el inventario como guardado
    localStorage.setItem('inventarioGuardado', 'true');

    getItems();

    inventarioForm.reset();
    mes.focus();

    // Reinicia el estado de edición
    editingStatus = false;

    window.location.reload();
});


// Funcion para borrar todos las variables guardadas en localStorage
//  localStorage.clear();




// Recuperar el estado del botón al cargar la página
window.addEventListener('load', () => {
    const botonDesactivado = localStorage.getItem('botonOculto');
    if (botonDesactivado === 'true') {
        botonRegistrar.style.display = 'none';
        botonRegistrar.disabled = true;
    }
});


// Función para revertir la ocultación 
const mostrarBoton = () => {
    botonRegistrar.style.display = 'block';
    botonRegistrar.disabled = false;
    localStorage.removeItem('botonOculto');
    localStorage.setItem('mostrarBoton', 'false');
};



// Arreglos para almacenar los datos del inventario
const meses = [];
const utilidad = [];

// Función para renderizar cada inventario en el contenido
const renderInventoryCards = async (inventory) => {
    const contenedorCartas = document.querySelector('.cartas');
    contenedorCartas.innerHTML = "";


    inventory.forEach(inv => {
        const nuevaCarta = document.createElement('div');
        nuevaCarta.classList.add('card');
        nuevaCarta.innerHTML = `
        <p>${inv.Mes}</p>
    <p>Cartera: ${inv.Cartera.toLocaleString()}</p>
    <p>Mercancia: ${inv.Mercancia.toLocaleString()}</p>
    <p>Por pagar: ${inv.PorPagar.toLocaleString()}</p>
    <p>Por recoger: ${inv.PorRecoger.toLocaleString()}</p>
    <p>Efectivo: ${inv.Efectivo.toLocaleString()}</p>
    <p>Utilidad Anterior: ${inv.UtilidadAnterior.toLocaleString()}</p>
    <p>Utilidad: ${inv.Utilidad.toLocaleString()}</p>
    <button onclick="validacionInventario('${inv.id}')" class="trabajar-inventario example-2">
        <div class="icon-content">  
    <img class="moon" src="./img/hammer.svg" alt="" srcset="">

        </div>
    </button>

    <button onclick="editInv('${inv.id}')" class="editar-inventario example-2">
        <div class="icon-content">
    <img class="moon" src="./img/pencil.svg" alt="" srcset="">

        </div>
    </button>


    <button onclick="borrarInventario('${inv.id}')" class="trabajar-inventario example-2">
    <div class="icon-content"> 
    <img class="moon" src="./img/archive.svg" alt="" srcset="">

    
    </div>
    </button>
`;
        contenedorCartas.appendChild(nuevaCarta);

        // Agregar los datos del inventario a los arreglos
        meses.push(inv.Mes);
        utilidad.push(inv.Utilidad);
    });

    // Crear el gráfico utilizando los datos recopilados
    createChart(meses, utilidad);
};

let graficoUtilidad; // Declara la variable graficoUtilidad fuera de la función createChart



const createChart = (meses, utilidad) => {

    // Destruye el gráfico existente si existe
    if (graficoUtilidad) {
        graficoUtilidad.destroy();
    }

    const ctx = document.getElementById('grafico-utilidad').getContext('2d');
    graficoUtilidad = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses, // Meses en el eje X
            datasets: [{
                label: 'Utilidad',
                data: utilidad, // Utilidad en el eje Y
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Empezar el eje Y desde cero
                }
            }
        }
    });
};



// Función para obtener productos y cartas de inventario
const getItems = async () => {
    try {
        // Obtener el inventario
        const inventory = await main.getInventory();

        // Renderizar productos y cartas de inventario 
        renderInventoryCards(inventory);
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
    }

};

// Cargar funcion que carga la lista de inventarios 
getItems();