# Evaluacion-REST

## Aplicación web para evaluación de empleados, areas y departamentos dentro de la institución de la Universidad Tecnológica del Norte de Aguascalientes

### Introducción a la App

La aplicación permitirá realizar la evaluación al desempeño del personal de la Universidad Tecnológica del Norte de Aguascalientes (UTNA) el cual su función será  
realizar la evaluación de todo el personal por sus diferentes áreas para por medio de ello medir y calificar su rendimiento laboral mediante un proceso técnico a través del cual, en forma integral, sistemática y continua; se valora el conjunto de actitudes, los rendimientos y el comportamiento laboral del personal durante el desempeño de su cargo.

> El objetivo principal será evaluar el desempeño del empleado o docente respecto a las funciones que se mencionan y en base a los estándares que se proporcionan.

## Vistazo a la App

Dentro de la pagina de inicio de sesión se ingresará el usuario (código de empleado o de administrador) para poder acceder al sistema. El usuario administrador es definido directamente en la base de datos, en caso que el usuario no tenga este rol se tomara como un usuario evaluador.

<p align="center">
  <img src="/docs/img/inicio_de_sesion.png" alt="Página de inicio para sesión"/>
</p>


### Página de inicio (Usuario administrador) 

El usuario administrador se identificará por tener un código de usuario con un formato distinto a los códigos de usuarios comunes, siendo su código por defecto “ad”. Al iniciar sesión con este usuario se enviará al usuario a una página distinta a la página de inicio (Véase en el Manual de Usuario).

En esta página se podrá ver y administrar los datos de los empleados, áreas, direcciones y subdirecciones, puesto y categorías, dando la posibilidad de añadir, editar y deshabilitar esta información.

<p align="center">
  <img src="/docs/img/inicio_admin.png" alt="Página de inicio para administrador"/>
</p>

Los controles están ubicados arriba de la lista de información, en un listón de fondo oscuro, en este solo habrá 3 botones, el primero, con el icono de cruz y de leyenda “Registrar Personal” será para abrir una ventana modal de registro de información empleados (véase en la página 19) y el segundo, con icono con forma de “V” y de leyenda “Cambiar Tabla” desplegará una pequeña lista que nos permitirá cambiar de “tablas” o colecciones existentes en la base de datos, para que sean plasmados los registros que contienen en la lista de información. 
“Nuevo Registro Para…” abrirá una ventana modal para seleccionar alguna de las tablas o colecciones dadas en una lista en donde se guardará el nuevo registro.

El administrador podrá dar de alta, modificar y deshabilitar usuarios de empleados en el sistema, ademas de asignar el rol de "super usuario" al usuario de sistema del empleado que estará encargado de gestionar las evaluaciones.

### Pagina de inicio (Usuario evaluador)

El panel de control es una tabla que lista al personal a cargo. Cada fila representa un subordinado y este puede tener 3 estados distintos: 
Sin evaluación, con evaluación y evaluación bloqueada o deshabilitada.

<p align="center">
  <img src="/docs/img/inicio_usuario.png" alt="Página de inicio para usuario"/>
</p>

1. Sin evaluación:
En la columna “Evaluación” se verá plasmada la frase “No realizado” con un fondo naranja claro. En la columna “Acciones” aparecerán 2 botones, el azul con icono de cruz, nos redirigirá a la página de evaluación. El botón rojo tendrá la función de bloquear la evaluación de la persona en cuestión, al dar clic en este botón, la persona dejará de aparecer en la lista de personal a evaluar en la página evaluación. Al refrescar la página, en el panel de control el empleado aparecerá con el estado de bloqueado.

2. Con evaluación:
Para cada empleado que se haya completado la evaluación del año en curso en la columna “Evaluación” se verá plasmada la frase “Realizado” con un fondo verde claro. Esto da constancia de que se registró exitosamente la evaluación. En este estado en la columna “Acciones”, aparecerá un botón de color verde con un icono de archivo, este botón tiene la función de generar y descargar el Formato de Evaluación del empleado en un archivo PDF, listo para su inmediata impresión.

3. Evaluación bloqueada / deshabilitada:
Este estado aparecerá después de que se ha hecho clic en el botón de bloqueo de evaluación, en la columna “Evaluación” aparecerá con la frase “Deshabilitado” con un fondo en color azul grisáceo claro. Tendré un botón gris con un icono de un candado abierto en la columna de “Acciones” y su función es la de remover el bloqueo de la evaluación al empleado.

### Página de evaluación
En esta página podremos realizar las evaluaciones para los empleados que estén disponibles, refiriéndose a que aún no tienen una evaluación en el año presente y que no tengan el estatus de evaluación deshabilitada.

<p align="center">
  <img src="/docs/img/pagina_evaluacion.png" alt="Página de evaluación al empleado"/>
</p>

#### Lista de personal a evaluar 
Esta lista tendrá los nombres de los empleados a los que podemos evaluar. Para comenzar la evaluación, se tendrá que dar un clic en el nombre de la persona. 

<p align="center">
  <img src="/docs/img/lista_personal_evaluar.png" alt="Lista de personal a evaluar"/>
</p>

Se dará una retroalimentación de la selección, plasmando un recuadro azul en el elemento donde aparece el nombre del empleado. Se puede apreciar en la siguiente imagen, dentro del recuadro rojo.

<p align="center">
  <img src="/docs/img/lista_personal_evaluar_1.png" alt="Lista de personal seleccionado a evaluar"/>
</p>

#### Formulario de evaluación 
El formulario de evaluación consta de 14 preguntas. Se deberán responder todas las preguntas para poder enviar el formulario.

<p align="center">
  <img src="/docs/img/formulario_evaluacion.png" alt="Formulario usado para evaluación"/>
</p>

Cada una de las opciones tiene una descripción para ayudar en la evaluación del personal, esta descripción se muestra con una herramienta llamada “Tooltip”.
Este recuadro solo aparecerá cuando se coloque el cursor o mouse encima de una de las opciones por un momento. Cada una de las opciones tiene una descripción distinta.

<p align="center">
  <img src="/docs/img/tooltip_evaluacion.png" alt="Tooltip de retroalimentación de opciones de evaluación"/>
</p>

#### Página de métricas 
La página de métricas será la encargada de mostrar datos resultantes de las evaluaciones. Esta información será plasmada en gráficas para su mejor comprensión.

<p align="center">
  <img src="/docs/img/metricas.png" alt="Pagina de métricas"/>
</p>

En este apartado se verá un botón con un icono de archivo con una flecha y de etiqueta “Descargar Reporte”, este botón hará que los datos de los lienzos de gráficas que se estén mostrando en la página sean descargados en un archivo de hojas de cálculo en formato Excel.

En la parte inferior de la página se podrá encontrar un botón con icono de cruz y la leyenda “Agregar Panel”. Su función es agregar en el lienzo de gráficas un panel vacío para plasmar información que se desee. Servirá para comparar entre paneles y mostrar datos de distintas divisiones al mismo tiempo, así como visualizar el rendimiento de los empleados, áreas y direcciones a través de los años.

<p align="center">
  <img src="/docs/img/graficas.png" alt="Ejemplo de gráficas"/>
</p>

En esta zona se mostrarán datos en las gráficas que el usuario desee plasmar dentro de límites definidos, como áreas o direcciones las cuales pertenezca dando solo detalles generales a la vez que solo mostrara datos de sus empleados a cargo. Una vez que haya información de evaluaciones de los empleados a cargo en la base de datos, por defecto, se mostrara la gráfica con nombre “Personal a Cargo”.

<p align="center">
  <img src="/docs/img/graficas_config.png" alt="Recuadro de configuración de gráficas"/>
</p>

De igual manera, cada panel tiene un botón de configuración para mostrar datos que el usuario elija. El botón tendrá un “tooltip” describiendo su función, y al hacer clic en el botón mostrará un pequeño menú con 3 listas desplegables.

- Área: La lista de áreas contendrá las áreas de los empleados a cargo, independientemente si el usuario (jefe al mando) es de un área distinta al empleado.

- Dirección: Esta lista es igual que la lista de áreas, solo que contendrá direcciones y subdirecciones en su lugar.

- Personal: Se tendrá la lista de personal con los puestos cada uno de los empleados a cargo, asignados al usuario.
