# Gestor-de-inventario 
 
---

# Sistema Gestion de Inventario


![Imagen del Sistema](/Capturas/Inventario.png)
![Imagen del Sistema](/Capturas/Productos.png)



Este proyecto es un sistema de inventario y registro de productos diseñado para ayudar a gestionar el inventario de una tienda o negocio. Proporciona funciones para registrar productos, mantener un seguimiento del inventario y generar informes mensuales de utilidad.


 
 

---

## Instalación

### Paso 1: Instalación de Dependencias

Para instalar las dependencias del proyecto, ejecuta el siguiente comando en tu terminal:

```bash
npm install
```

Este comando instalará todas las dependencias necesarias para el correcto funcionamiento del sistema.

### Paso 2: Configuración de la Base de Datos

Utilizaremos XAMPP para crear la base de datos y ejecutar el script SQL proporcionado en la carpeta `Base_Inventario`.

1. Descarga e instala [XAMPP](https://www.apachefriends.org/es/download.html) si aún no lo tienes.
2. Inicia los servicios de Apache y MySQL desde el panel de control de XAMPP.
3. Abre tu navegador web y accede a phpMyAdmin (por lo general, disponible en `http://localhost/phpmyadmin`).
4. Crea una nueva base de datos para el sistema de inventario llamada Base_Inventario.
5. Ejecuta el SQL ubicado en la carpeta `Base_Inventario` a la base de datos que acabas de crear. Este archivo contiene la estructura de la base de datos y los datos iniciales necesarios.

### Paso 3: Instalación y Ejecución de Electron

1. Instala Electron de forma global si aún no lo has hecho:

```bash
npm install -g electron
```

2. Inicia la aplicación utilizando Electron:

```bash
electron .
```

Este comando iniciará la aplicación con Electron y podrás acceder al sistema de gestión de inventario.

---


## Idea General del Proyecto

El sistema tiene como objetivo proporcionar al usuario una plataforma fácil de usar para gestionar el inventario del negocio.

### Funcionalidades Principales
 
- **Menú Principal:** Ofrece acceso a las secciones de productos e inventario.
- **Productos:** Permite registrar, editar y eliminar productos.
- **Inventario:** Facilita el seguimiento del inventario(registrar cantidades),informes mensuales de la utilidad.

## Detalles de Funcionamiento

### Ventana de Inventario

- **Buscador de Productos:** Permite buscar productos dentro de la tabla "Products".
- **Lista de Productos:** Muestra los productos disponibles con opciones para editar y borrar.
- **Menú de Registro de Productos:** Permite agregar nuevos productos con nombre, tipo de unidad y precio.

### Proceso de Inventario


## Diagramas

- **Diagrama de Utilidad:** Muestra la utilidad de los meses creados.
- **Tabla de Datos Mensuales:** Contiene información detallada sobre cada mes trabajado, incluyendo mercancía, por pagar, por recoger, utilidad anterior y utilidad.


- **Generación de Datos Mensuales:** Permite ingresar información sobre el mes trabajado, la mercancía, por pagar, por recoger y utilidad anterior.  

  Calculo que obtiene la utilidad:
[

    Suma de Activos Corrientes: Primero, se calcula el total de activos corrientes, que incluye:
        Cartera,
        Por Recoger: Cualquier otro ingreso pendiente de ser recibido.
        Mercancía: El valor de los bienes disponibles para la venta.

    A esta suma de activos, se le resta el total de pasivos corrientes, deudas pendientes de pago, conocidas como Por Pagar.

    Ejemplo Práctico:

    Utilidad Anterior: $5 millones.
    Suma de los datos Cartera, Por recoger, Mercancía del Periodo Actual: $10 millones.

    Utilidad Final: $10 millones (Utilidad Actual) - $5 millones (Utilidad Anterior) = $5 millones.
]

- **Generación del Inventario:** Agregando las cantidades que hay a los productos, para que el sistema haga el calculo del total y de la mercancia.
- **Exportación de Datos:** Al Finalizar el inventario del mes exporta los datos en un archivo Excel, incluyendo detalles como el nombre, precio, tipo de unidad, cantidad y total.
- 

--- 



Este README proporciona una visión general del proyecto y las funcionalidades principales que ofrece.

Version 1.0.0

[Carlos Muñoz]
# Gestor-de-inventario
