# Biblioteca escolar

Aplicación web para controlar el catálogo y los préstamos de una biblioteca pequeña. Usa HTML, CSS y JavaScript. Funciona con un navegador actualizado y sin instalar dependencias.

## Uso

1. Extrae el ZIP en una carpeta.
2. Abre `index.html` con Chrome, Edge, Firefox o Safari.
3. Selecciona **Registrar libro** e ingresa el título y el autor.
4. Usa **Prestar** en la fila de un libro e ingresa el nombre del lector.
5. Selecciona **Devolver** para liberar el ejemplar. Puedes buscar por título o autor y filtrar por estado.

El catálogo se abre con 12 libros de ejemplo disponibles. La lista se encuentra en `CATALOGO_INICIAL`, dentro de `js/biblioteca.js`.

Cada ejemplar recibe un ID distinto, incluso si hay dos copias del mismo libro. El préstamo activo conserva el nombre del lector y la fecha. Al devolver un ejemplar, su préstamo activo se elimina.

**Archivos.** Los cambios se guardan en `localStorage` donde el navegador permite almacenamiento local. Con **Descargar JSON** se crea `biblioteca-respaldo.json`. Con **Cargar JSON** puedes abrir un respaldo y reemplazar el catálogo actual previa confirmación. El archivo incluye los libros y los préstamos activos. Si cambias de navegador o abres la aplicación desde otra ubicación, usa el respaldo para trasladar el catálogo.

## Estructura del código

| Archivo | Función |
| --- | --- |
| `index.html` | Estructura del catálogo, búsqueda y formularios |
| `css/estilos.css` | Diseño y adaptación a pantallas pequeñas |
| `js/biblioteca.js` | Catálogo inicial, registro, búsqueda, filtros y reglas de préstamo |
| `js/archivos.js` | Guardado local, validación, lectura y descarga de JSON |
| `js/app.js` | Eventos de la interfaz y actualización de la vista |
| `docs/` | Manual, diagrama y guion para la exposición |

## Trabajo en GitHub

El paquete incluye `biblioteca-historial.bundle` para recuperar el historial local y sus ramas. El ZIP también contiene el código listo para ejecutar.

Para restaurar Git y sus ramas desde la carpeta que contiene el archivo `.bundle`:

```sh
git clone biblioteca-historial.bundle biblioteca-equipo
cd biblioteca-equipo
git fetch origin 'refs/heads/*:refs/remotes/origin/*'
git branch -a
```

Crea un repositorio vacío en GitHub. Para compartir de inmediato la versión funcional, conserva el repositorio del archivo como referencia y agrega el repositorio del equipo como remoto:

```sh
git remote rename origin historial
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

Cada integrante debe abrir **al menos tres Pull Requests desde su propia cuenta**, con cambios revisables. Una vez publicado `main`, cada integrante puede preparar una mejora por rama:

```sh
git switch main
git pull --ff-only origin main
git switch -c mejora/descripcion-breve
# Edita y verifica los archivos.
git add ARCHIVO_MODIFICADO
git commit -m "Describe el cambio realizado"
git push -u origin mejora/descripcion-breve
```

En GitHub, abre un PR de esa rama hacia `main`. Describe qué cambió y cómo se verificó. Pide a otro integrante que revise el código y pruebe la aplicación antes de integrar. Registra los enlaces de los tres PR por integrante.

Si aparece un conflicto, actualiza `main` local, vuelve a la rama del PR y ejecuta `git merge main`. Abre los archivos marcados, acuerda la versión final, elimina las marcas de conflicto, verifica la aplicación y guarda la resolución con `git add`, `git commit` y `git push`.

Para presentar el historial de implementación mediante PR desde el inicio, publica `historial/entrega/inicio:main` en un remoto vacío en lugar de publicar el `main` completo. Después sube y revisa en orden `funcionalidad/catalogo`, `funcionalidad/prestamos`, `funcionalidad/archivos`, `funcionalidad/interfaz` y `entrega/documentacion`. Integra cada rama antes de abrir la siguiente y conserva los commits mediante **Create a merge commit**. Este flujo no sustituye las contribuciones de cada integrante.

Consulta la [guía de Pull Requests de GitHub](https://docs.github.com/en/pull-requests/get-started/pull-request-quickstart) y su [guía de conflictos](https://docs.github.com/en/pull-requests/reference/merge-conflicts).
