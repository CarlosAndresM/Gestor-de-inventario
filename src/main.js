// pintar una ventana por pantalla
const {
    BrowserWindow,
    ipcMain,
    Notification,
    Menu
} = require('electron');
const {
    getConnection
} = require('./database')
 
// Para manejar Excel: 
const XlsxPopulate = require('xlsx-populate');
const Workbook = require('xlsx-populate/lib/Workbook');
const {
    dialog
} = require('electron');
 

let window;
  
function createWindow() {
    window = new BrowserWindow({
        height: 1200,
        width: 1600,
        webPreferences: {

            nodeIntegration: true, // Habilitar la integración con Node.js en el proceso de renderizado
            contextIsolation: false, // Deshabilitar el aislamiento de contexto para poder usar require en el proceso de renderizado
        }
    })

    window.loadFile('src/ui/index.html')


  // Desactivar los menús de la aplicación
  Menu.setApplicationMenu(null);
 

    // Funciones necesarios para las operaciones crud


    ipcMain.on('datos-formulario', (event, data) => {
        createProduct(data);

    })

    // Escucha el evento 'datos-mensuales' enviado desde el proceso de renderizado
    ipcMain.on('datos-mensuales', (event, newInventario) => {
        // Aquí puedes procesar los datos recibidos del formulario 
        createInv(newInventario)
    });



    // Escucha un evento desde el proceso de renderizado
    ipcMain.on('export-to-excel', (event, data) => {
        const {
            id,
            mes
        } = data
        exportToExcel(id, mes)
    });




    // Escuchar evento desde el proceso renderizador para editar la cantidad del producto
    ipcMain.on('editar-cantidad', (event, id) => {
        // Envía el ID del producto al evento de envío del formulario
        console.log('procseo principal: ', id)
        window.webContents.send('editar-cantidad', id);
    });


    

    // Funcion para insertar datos en la tabla inventario

    async function createInv(inv) {
        try {
            const conn = await getConnection()

            inv.Cartera = parseFloat(inv.Cartera)
            inv.PorPagar = parseFloat(inv.PorPagar)
            inv.PorRecoger = parseFloat(inv.PorRecoger)
            inv.Efectivo = parseFloat(inv.Efectivo)
            inv.UtilidadAnterior = parseFloat(inv.UtilidadAnterior)
            inv.Utilidad = parseFloat(((inv.Cartera + inv.Mercancia + inv.PorRecoger) - inv.PorPagar) - inv.UtilidadAnterior)
            const result = await conn.query('INSERT INTO Inventario SET ?', inv)

            new Notification({
                title: 'Sistema de inventario',
                body: 'Inventario ' + inv.Mes + ' generado'
            }).show()
            console.log(result)
            return result

        } catch (error) {
            console.log(error)

        }

    }





    // Funcion para crear un producto

    async function createProduct(product) {

        try {

            const conn = await getConnection();
            product.precio = parseFloat(product.precio)
            product.nombre = String(product.nombre)
            const result = await conn.query('INSERT INTO Products SET ?', product)
            console.log(result)

            new Notification({
                title: 'Sistema de inventario',
                body: 'Producto registrado con exito'
            }).show(); 


        } catch (error) {
            console.log(error)
        }

    }



    // Función para exportar los datos a excel del inventario trabajado
    async function exportToExcel(id, mes) {
        console.log(id, mes);

        try {
            // Obtener los productos del inventario
            const products = await getProductsInv(id);

            // Mostrar el cuadro de diálogo para seleccionar la ubicación del archivo
            dialog.showSaveDialog({
                title: 'Guardar inventario en Excel',
                defaultPath: `Inventario_${mes}.xlsx`, // Nombre de archivo predeterminado
                filters: [{
                    name: 'Archivos de Excel',
                    extensions: ['xlsx']
                }]
            }).then(async result => {
                if (!result.canceled) {
                    const filePath = result.filePath;
                    console.log('Ruta seleccionada:', filePath);

                    // Obtener la suma total de la columna "Total" de la tabla Products_inventario
                    const totalValue = await getTotalSum(id);


                    // Crear el archivo Excel y escribir en él
                    await XlsxPopulate.fromBlankAsync()
                        .then(async workbook => {
                            // Modificar el libro de trabajo y agregar los títulos
                            const sheet = workbook.sheet("Sheet1");
                            sheet.cell("A1").value("id_producto");
                            sheet.cell("B1").value(mes);
                            sheet.cell("C1").value("Nombre de producto");
                            sheet.cell("D1").value("Tipo de unidad");
                            sheet.cell("E1").value("Precio");
                            sheet.cell("F1").value("Cantidad");
                            sheet.cell("G1").value("Total");
                            sheet.cell("H1").value("Mercancia");


                            // Escribir los datos de los productos en el archivo Excel
                            products.forEach((product, index) => {
                                const rowIndex = index + 2; // Comenzar desde la segunda fila
                                sheet.cell(`A${rowIndex}`).value(product.id_product);
                                sheet.cell(`B${rowIndex}`).value(product.id_mes);
                                sheet.cell(`C${rowIndex}`).value(product.NombreP);
                                sheet.cell(`D${rowIndex}`).value(product.Tipo_unidad);
                                sheet.cell(`E${rowIndex}`).value(product.Precio);
                                sheet.cell(`F${rowIndex}`).value(product.Cantidad);
                                sheet.cell(`G${rowIndex}`).value(product.Total);
                            });


                            sheet.cell("H2").value(totalValue);

                            // Guardar el archivo Excel
                            return workbook.toFileAsync(filePath);


                        })
                        .then(() => {
                            console.log('Exportación exitosa a ', filePath);
                        })
                        .catch(err => {
                            console.error('Error al exportar en excel ', err);
                        });
                }
            }).catch(err => {
                console.error('Error al mostrar el cuadro de diálogo: ', err);
            });
        } catch (error) {
            console.error('Error al obtener los productos del inventario: ', error);
        }
    }





}


// Función asincrónica para obtener la suma total de la columna "Total" de la tabla Products_inventario
async function getTotalSum(id_mes) {
    try {
        const conn = await getConnection();
        const results = await conn.query('SELECT SUM(Total) AS total_sum FROM Products_inventario WHERE id_mes = ?', [id_mes]);
        const totalValue = results[0].total_sum;
        return totalValue;
    } catch (error) {
        console.error('Error al obtener la suma total: ', error);
        throw error;
    }
}



// Actualizar utilidad del inventario recien terminado
async function updateUtility(id) {
    try {
        const conn = await getConnection();
        const MercanciaTotal = await getTotalSum(id);

        // Actualizar la mercancía
        const result = await conn.query('UPDATE Inventario SET Mercancia = ? WHERE id = ?', [MercanciaTotal, id]);

        // Calcular la utilidad
        const utilityQuery = await conn.query('SELECT SUM((Cartera + PorRecoger + Mercancia - PorPagar - UtilidadAnterior)) AS total_sum FROM Inventario WHERE id = ?', id);
        const calculatedUtility = utilityQuery[0].total_sum;

        // Actualizar la utilidad
        const resultUtility = await conn.query('UPDATE Inventario SET Utilidad = ? WHERE id = ?', [calculatedUtility, id]);

        console.log('Utilidad actualizada. Se ha terminado un inventario.');
        return {
            result,
            resultUtility
        };

    } catch (error) {
        console.log(error);
        throw error;
    }
}



// Función para obtener productos


async function getProducts() {
    try {
        const conn = await getConnection();
        // Consulta SQL para obtener los últimos 10 productos de manera descendente
        const results = await conn.query('SELECT * FROM Products ORDER BY id DESC');

        return results;
    } catch (error) {
        console.log(error);
        return []; // Devuelve un array vacío en caso de error
    }
}




// Funcion para borrar producto
async function deleteProduct(id) {
    try {

        
            const conn = await getConnection();
            const result = await conn.query('DELETE FROM Products WHERE id = ?', id);
            console.log('Producto borrado con éxito');
            return result;
      
    } catch (error) {
        // Verificar si el error es debido a la restricción de clave externa
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            alert('Este producto hace parte de uno o varios inventarios por lo que no puede ser borrado.');
        } else {
            console.error(error);
        }
    }
}



// Funcion para borrar un inventario especificado
async function deleteInventoryById(id) {
    try {
            const conn = await getConnection();
            const result = await conn.query('DELETE FROM Inventario WHERE id = ?', id);
            console.log(result);
            return result    
       
       } catch (error) {
        console.log(error)
    }
}



// Funcion para obtener el id del producto

async function getProductById(id) {
    const conn = await getConnection()
    const result = await conn.query('SELECT * FROM Products where id = ?', id);
    return result[0]
}

// Funcion para editar el producto
async function updateProduct(id, product) {
    try { 
        const conn = await getConnection();
        const result = await conn.query('UPDATE Products SET ? WHERE id = ?', [product, id]);

        console.log('Producto actualizado con exito')
        return result
     
    } catch (error) {
        console.error('Error updating product:', error);
        throw error; 
    }
}


// Funcion para editar el producto
async function updateInv(id, inv) {
    try { 
        const conn = await getConnection();
        const result = await conn.query('UPDATE Inventario SET ? WHERE id = ?', [inv, id]);

        console.log('Inventario actualizado con exito')
        return result
     
    } catch (error) {
        console.error('Error updating inventario:', error);
        throw error;  
    }
}



// Obtener las carpetas datos de inventarios 

async function getInventory() {
    try {
        const conn = await getConnection();
        const results = await conn.query('SELECT * FROM Inventario ORDER BY id DESC');
        return results;  
    } catch (error) {
        console.log(error);
        return []; // Devuelve un array vacío en caso de error
    }
}

// Obtener el id seleccionado del inventario
async function getInventoryById(id) {
    try {
        const conn = await getConnection();
        const results = await conn.query('SELECT * FROM Inventario WHERE id = ? ORDER BY id DESC', [id]);
        return results[0]; // Devuelve el primer resultado de la consulta, que debería ser único
    } catch (error) {
        console.log(error);
        return null; // Devuelve null en caso de error o si no se encuentra ningún registro con ese ID
    }
}



// Funcion para obtener los productos del inventario

async function getProductsInv(id_mes) {
    try {
        const conn = await getConnection();
        const results = await conn.query('SELECT * FROM Products_inventario WHERE id_mes = ? ORDER BY id DESC', id_mes)
        // console.log(results)
        return results
    } catch (error) {
        console.log(error)
    }
}


// Funcion para obtener el id del producto del inventario
async function getProductsInvById(id) {
    try {
        const conn = await getConnection();
        const results = await conn.query('SELECT * FROM Products_inventario WHERE id = ? ORDER BY id DESC', [id]);
        return results[0]

    } catch (error) {
        console.log(error)
        return null
    }
}


async function insertProductsIntoInv(idMes) {
    try {
        const conn = await getConnection();

        // Consulta para insertar los productos en el inventario
        const results = await conn.query(`
            INSERT INTO Products_inventario (id_product, id_mes, NombreP, Tipo_unidad, Precio, Cantidad, Total)
            SELECT p.id, i.id, p.nombre, p.tipo_unidad, p.precio, 0, 0
            FROM Products p, Inventario i
            WHERE i.id = ?;
        `, [idMes]);

        console.log('Productos insertados en el inventario correctamente.');
        console.log(results);
        return results;

    } catch (error) {
        console.error('Error al insertar productos en el inventario:', error);
        throw error;  
    }
}


// Funcion para validar si ese inventario existe
async function checkInventoryExists(idMes) {
    try {
        const conn = await getConnection();

        // Realizar la consulta para verificar si existen datos en Products_inventario para el id_mes
        const results = await conn.query('SELECT * FROM Products_inventario WHERE id_mes = ?', idMes);
        const id = Number(results);
        console.log(id)
        if (results.length === 0) {
            // Si no hay datos en la tabla Products_inventario, insertar los productos
            await insertProductsIntoInv(idMes);
        } else {
            // Si hay datos en la tabla Products_inventario, no hacer nada
            console.log('El inventario ya ha sido creado.');
        }
    } catch (error) {
        console.log('Error al verificar la existencia de datos en Products_inventario:', idMes, error);
        throw error;
    }
}


// Funcion para actualizar la cantidad y el total del producto
async function updateProductQuantityAndTotal(idMes, idP, newQuantity, newTotal) {
    try {

        const conn = await getConnection();
        // Convertir los parámetros a números enteros o números de punto flotante
        idMes = parseInt(idMes);
        idP = parseInt(idP);
        newQuantity = parseInt(newQuantity);
        newTotal = parseInt(newTotal);
        console.log(idMes, idP, newQuantity, newTotal);


        // Consulta para actualizar la cantidad y el total del producto
        const results = await conn.query('UPDATE Products_inventario SET Cantidad = ?, Total = ? WHERE id_mes = ? AND id = ?', [newQuantity, newTotal, idMes, idP]);

        console.log(results);
        console.log('Cantidad y total del producto actualizados correctamente.');
        return results;
    } catch (error) {
        console.error('Error al actualizar la cantidad y el total del producto:', error);
        throw error;
    }
}
 
// Función para validar el usuario y la contraseña
async function validarCredenciales(nombreUsuario, contrasena) {
    try {
        // Establecer la conexión a la base de datos
        const conn = await getConnection();

        // Consultar la base de datos para verificar las credenciales
        const results = await conn.query('SELECT * FROM Usuarios WHERE nombre_usuario = ? and contrasena = ?', [nombreUsuario, contrasena]);

        // Verificar si se encontraron resultados
        if (results.length > 0) {
            const usuario = results[0].rol; // obtener el rol de ese usuario
            console.log(usuario)
            return usuario;
        } else {
         // Usuario no encontrado, mantener el usuario actual
         console.log('Usuario o contraseña incorrectos. No se realizaron cambios.');
         return null; // Devolver null para indicar que no se encontró el usuario
       }
    } catch (error) {
        console.log(error);
        throw error;  
    }
}


// Función para cerrar usuario (borrar usuario del localStorage)
function cerrarSeccion() {
    localStorage.removeItem('usuario');
}





module.exports = {
    createWindow,
    getProducts,
    deleteProduct,
    getProductById,
    updateProduct,
    getInventory,
    getInventoryById,
    updateInv,
    getProductsInv,
    getProductsInvById,
    insertProductsIntoInv,
    checkInventoryExists,
    updateProductQuantityAndTotal,
    deleteInventoryById,
    getTotalSum,
    updateUtility,
    cerrarSeccion,
    validarCredenciales
}