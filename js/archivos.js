"use strict";

// El navegador guarda los cambios. Un JSON portable permite hacer respaldos.
const Archivos = {
    clave: "biblioteca-escolar-v1",

    cargar() {
        const datos = localStorage.getItem(this.clave);
        if (datos === null) {
            return Biblioteca.agregarCatalogoInicial([]);
        }

        const catalogo = this.leerDatos(datos);
        // Las versiones anteriores no traían títulos de ejemplo.
        return catalogo.catalogoInicial === true
            ? catalogo.libros
            : Biblioteca.agregarCatalogoInicial(catalogo.libros);
    },

    guardar(libros) {
        // Esta marca permite conservar el contenido exacto de un respaldo restaurado.
        const datos = { version: 1, catalogoInicial: true, libros };
        localStorage.setItem(this.clave, JSON.stringify(datos));
    },

    crearJSON(libros) {
        return JSON.stringify({ version: 1, libros }, null, 2);
    },

    leerJSON(texto) {
        return this.leerDatos(texto).libros;
    },

    leerDatos(texto) {
        let datos;
        try {
            datos = JSON.parse(texto.replace(/^\uFEFF/, ""));
        } catch {
            throw new Error("El archivo no contiene un JSON válido.");
        }
        if (!datos || datos.version !== 1 || !Array.isArray(datos.libros)) {
            throw new Error("Selecciona un respaldo generado por esta aplicación.");
        }

        const ids = new Set();
        const textoValido = (valor) => typeof valor === "string" && valor.trim() !== "";
        for (const libro of datos.libros) {
            if (!libro || !Number.isSafeInteger(libro.id) || libro.id < 1 ||
                ids.has(libro.id) || !textoValido(libro.titulo) || !textoValido(libro.autor)) {
                throw new Error("El respaldo contiene un libro incompleto o un ID repetido.");
            }
            const prestamo = libro.prestamo;
            if (prestamo !== null &&
                (!prestamo || !textoValido(prestamo.lector) ||
                    typeof prestamo.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(prestamo.fecha))) {
                throw new Error("El respaldo contiene un préstamo incompleto.");
            }
            ids.add(libro.id);
        }
        return datos;
    },

    descargar(libros) {
        const archivo = new Blob([this.crearJSON(libros)], { type: "application/json" });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "biblioteca-respaldo.json";
        document.body.append(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
};
