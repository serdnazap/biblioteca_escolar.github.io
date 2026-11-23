"use strict";

// Títulos de ejemplo. El catálogo puede crecer desde la interfaz.
const CATALOGO_INICIAL = [
    ["Cien años de soledad", "Gabriel García Márquez"],
    ["El principito", "Antoine de Saint-Exupéry"],
    ["Don Quijote de la Mancha", "Miguel de Cervantes"],
    ["La metamorfosis", "Franz Kafka"],
    ["El túnel", "Ernesto Sabato"],
    ["Como agua para chocolate", "Laura Esquivel"],
    ["La casa de los espíritus", "Isabel Allende"],
    ["Pedro Páramo", "Juan Rulfo"],
    ["El llano en llamas", "Juan Rulfo"],
    ["Ficciones", "Jorge Luis Borges"],
    ["El diario de Ana Frank", "Ana Frank"],
    ["Matilda", "Roald Dahl"],
];

// Cada elemento de la lista representa un ejemplar con un ID propio.
const Biblioteca = {
    registrar(libros, titulo, autor) {
        titulo = titulo.trim();
        autor = autor.trim();
        if (!titulo || !autor) {
            throw new Error("Escribe el título y el autor.");
        }

        let id = 1;
        for (const libro of libros) {
            if (libro.id >= id) {
                id = libro.id + 1;
            }
        }
        if (!Number.isSafeInteger(id)) {
            throw new Error("El catálogo alcanzó el límite de identificadores.");
        }
        const nuevoLibro = { id, titulo, autor, prestamo: null };
        libros.push(nuevoLibro);
        return nuevoLibro;
    },

    agregarCatalogoInicial(libros) {
        // Conserva el ID y el préstamo de cualquier ejemplar ya registrado.
        for (const [titulo, autor] of CATALOGO_INICIAL) {
            const existe = libros.some((libro) =>
                this.normalizar(libro.titulo.trim()) === this.normalizar(titulo) &&
                this.normalizar(libro.autor.trim()) === this.normalizar(autor)
            );
            if (!existe) {
                this.registrar(libros, titulo, autor);
            }
        }
        return libros;
    },

    normalizar(texto) {
        // Quita los acentos para aceptar, por ejemplo, «garcia» y «García».
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    },

    buscar(libros, consulta) {
        const texto = this.normalizar(consulta.trim());
        return libros.filter((libro) => {
            const titulo = this.normalizar(libro.titulo);
            const autor = this.normalizar(libro.autor);
            return titulo.includes(texto) || autor.includes(texto);
        });
    },


    obtenerPorId(libros, id) {
        const libro = libros.find((ejemplar) => ejemplar.id === id);
        if (!libro) {
            throw new Error("El ejemplar seleccionado no existe.");
        }
        return libro;
    },

    filtrarPorEstado(libros, estado) {
        if (estado === "todos") {
            return libros;
        }
        return libros.filter((libro) => (libro.prestamo !== null) === (estado === "prestados"));
    },

    prestar(libros, id, lector) {
        const libro = this.obtenerPorId(libros, id);
        lector = lector.trim();
        if (!lector) {
            throw new Error("Escribe el nombre del lector.");
        }
        if (libro.prestamo !== null) {
            throw new Error("Ese ejemplar ya tiene un préstamo activo.");
        }

        // Un préstamo activo contiene el nombre del lector y la fecha local.
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        libro.prestamo = { lector, fecha: anio + "-" + mes + "-" + dia };
    },

    devolver(libros, id) {
        const libro = this.obtenerPorId(libros, id);
        if (libro.prestamo === null) {
            throw new Error("Este ejemplar ya está disponible.");
        }
        libro.prestamo = null;
    },
};
