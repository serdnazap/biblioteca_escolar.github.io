"use strict";

// Conecta los formularios y la tabla con los módulos de datos y archivos.
const porId = (id) => document.getElementById(id);
const dialogoLibro = porId("dialogo-libro");
const dialogoPrestamo = porId("dialogo-prestamo");
const formularioLibro = porId("formulario-libro");
const formularioPrestamo = porId("formulario-prestamo");
const archivoJSON = porId("archivo-json");
const busqueda = porId("busqueda");
const filas = porId("filas");

let libros = [];
let filtro = "todos";
let idPrestamo = null;
let guardadoLocal = true;
let respaldoNecesario = false;

function mostrarAviso(mensaje, esError = false) {
    const aviso = porId("aviso");
    aviso.textContent = mensaje;
    aviso.classList.toggle("error", esError);
    aviso.hidden = mensaje === "";
}

function mostrarError(formulario, mensaje) {
    const error = porId("error-" + formulario);
    error.textContent = mensaje;
    error.hidden = mensaje === "";
}

function cargarCatalogo(alIniciar = false) {
    try {
        libros = Archivos.cargar();
        respaldoNecesario = false;
        mostrarAviso("");
    } catch (error) {
        if (error.name === "SecurityError") {
            guardadoLocal = false;
            if (alIniciar) {
                libros = Biblioteca.agregarCatalogoInicial([]);
            }
            mostrarAviso("El navegador bloqueó el guardado local. Descarga un JSON antes de cerrar.", true);
        } else {
            respaldoNecesario = true;
            mostrarAviso("No se pudo leer el catálogo guardado. Carga un respaldo JSON para recuperarlo.", true);
        }
    }
}

function guardarCatalogo(cambios) {
    // Actualiza la vista solo después de intentar guardar los cambios.
    if (guardadoLocal) {
        try {
            Archivos.guardar(cambios);
        } catch (error) {
            if (error.name !== "SecurityError") {
                throw new Error("No se pudo guardar. Revisa el espacio o los permisos del navegador.");
            }
            guardadoLocal = false;
        }
    }
    libros = cambios;
    respaldoNecesario = false;
    actualizarVista();
}

function aplicarCambio(operacion) {
    if (respaldoNecesario) {
        throw new Error("Carga un respaldo JSON para recuperar el catálogo.");
    }
    // La copia conserva el catálogo anterior si la operación o el guardado falla.
    const cambios = structuredClone(libros);
    operacion(cambios);
    guardarCatalogo(cambios);
}

function confirmar(mensaje) {
    if (!guardadoLocal) {
        mensaje += " Descarga un JSON para conservar los cambios.";
    }
    mostrarAviso(mensaje);
}

function crearCelda(fila, texto) {
    const celda = fila.insertCell();
    celda.textContent = texto;
    return celda;
}

function agregarLinea(celda, etiqueta, texto, clase = "") {
    const linea = document.createElement(etiqueta);
    linea.textContent = texto;
    linea.className = clase;
    celda.append(linea);
}

function mostrarLibro(libro) {
    const fila = filas.insertRow();
    crearCelda(fila, libro.id);
    const datos = crearCelda(fila, "");
    agregarLinea(datos, "strong", libro.titulo);
    agregarLinea(datos, "small", libro.autor);

    const estado = crearCelda(fila, "");
    const prestado = libro.prestamo !== null;
    if (prestado) {
        agregarLinea(estado, "strong", "Prestado", "estado prestado");
        agregarLinea(estado, "small", libro.prestamo.lector + " · " + libro.prestamo.fecha);
    } else {
        agregarLinea(estado, "strong", "Disponible", "estado");
    }

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "accion";
    boton.textContent = prestado ? "Devolver" : "Prestar";
    boton.setAttribute("aria-label", boton.textContent + " " + libro.titulo + ", ID " + libro.id);
    boton.addEventListener("click", () => {
        if (prestado) {
            try {
                aplicarCambio((cambios) => Biblioteca.devolver(cambios, libro.id));
                confirmar("Devolución registrada.");
            } catch (error) {
                mostrarAviso(error.message, true);
            }
        } else {
            idPrestamo = libro.id;
            formularioPrestamo.reset();
            mostrarError("prestamo", "");
            porId("libro-prestamo").textContent = libro.titulo + " · ID " + libro.id;
            dialogoPrestamo.showModal();
        }
    });
    crearCelda(fila, "").append(boton);
}

function actualizarVista() {
    const prestados = Biblioteca.filtrarPorEstado(libros, "prestados").length;
    porId("total").textContent = libros.length;
    porId("total-prestados").textContent = prestados;
    porId("total-disponibles").textContent = libros.length - prestados;

    const seleccionados = Biblioteca.filtrarPorEstado(libros, filtro);
    const resultados = Biblioteca.buscar(seleccionados, busqueda.value);
    filas.replaceChildren();
    for (const libro of resultados) {
        mostrarLibro(libro);
    }

    const vacio = porId("vacio");
    vacio.textContent = libros.length === 0
        ? "Aún no hay libros registrados."
        : "No hay ejemplares que coincidan con la búsqueda o el filtro.";
    vacio.hidden = resultados.length > 0;
    porId("tabla").hidden = resultados.length === 0;
}

porId("agregar").addEventListener("click", () => {
    formularioLibro.reset();
    mostrarError("libro", "");
    dialogoLibro.showModal();
});

for (const boton of document.querySelectorAll("[data-cerrar]")) {
    boton.addEventListener("click", () => boton.closest("dialog").close());
}

formularioLibro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    try {
        aplicarCambio((cambios) => {
            Biblioteca.registrar(cambios, porId("titulo").value, porId("autor").value);
        });
        dialogoLibro.close();
        confirmar("Libro registrado.");
    } catch (error) {
        mostrarError("libro", error.message);
    }
});

formularioPrestamo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    try {
        aplicarCambio((cambios) => Biblioteca.prestar(cambios, idPrestamo, porId("lector").value));
        dialogoPrestamo.close();
        confirmar("Préstamo registrado.");
    } catch (error) {
        mostrarError("prestamo", error.message);
    }
});

busqueda.addEventListener("input", actualizarVista);

const botonesFiltro = porId("filtros").querySelectorAll("button");
for (const boton of botonesFiltro) {
    boton.addEventListener("click", () => {
        filtro = boton.dataset.estado;
        for (const otro of botonesFiltro) {
            otro.setAttribute("aria-pressed", String(otro === boton));
        }
        actualizarVista();
    });
}

porId("exportar").addEventListener("click", () => {
    if (respaldoNecesario) {
        mostrarAviso("Carga un respaldo válido antes de descargar el catálogo.", true);
        return;
    }
    Archivos.descargar(libros);
});

porId("importar").addEventListener("click", () => archivoJSON.click());

archivoJSON.addEventListener("change", async () => {
    const archivo = archivoJSON.files[0];
    if (!archivo) {
        return;
    }
    try {
        const importados = Archivos.leerJSON(await archivo.text());
        if ((libros.length > 0 || respaldoNecesario) &&
            !window.confirm("¿Reemplazar el catálogo actual con este respaldo?")) {
            return;
        }
        guardarCatalogo(importados);
        confirmar("Respaldo cargado.");
    } catch (error) {
        mostrarAviso(error.message, true);
    } finally {
        archivoJSON.value = "";
    }
});

// Mantiene actualizada la vista si otra pestaña del mismo sitio guarda cambios.
window.addEventListener("storage", (evento) => {
    if (evento.key === Archivos.clave || evento.key === null) {
        cargarCatalogo();
        actualizarVista();
    }
});

cargarCatalogo(true);
actualizarVista();
