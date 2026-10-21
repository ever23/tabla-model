# tabla-model

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

**tabla-model** es el motor central de definición de esquemas y generación de SQL para el ecosistema `dbtabla`. Permite definir la estructura de tus tablas en JavaScript/TypeScript de forma declarativa, permitiendo que tus aplicaciones sean agnósticas al motor de base de datos (MySQL, SQLite, PostgreSQL, SQL Server).

## 🚀 Características Principales

*   **Definición Declarativa**: Estructura tus datos usando objetos de JS/TS limpios y legibles.
*   **Traductor Universal de SQL**: Genera sentencias `CREATE TABLE` optimizadas para diferentes dialectos.
*   **Extensibilidad (Model Methods)**: Inyecta lógica de negocio personalizada directamente en las instancias de tabla con acceso a `tabla` y `db`.
*   **Gestión de Semillas (Seeds)**: Define datos iniciales que deben existir al crear la tabla (`modelo.insert(...)`).
*   **Claves Foráneas Flexibles**: Soporta definición dentro de opciones o mediante llamadas secuenciales (`modelo.foreignKey(...)`).
*   **Tipado TypeScript Completo**: Soporte genérico para modelos e inferencia de propiedades (`new tablaModel<Usuario>(...)`).
*   **Ingeniería Inversa**: Convierte sentencias SQL existentes en modelos de JavaScript de forma automática.
*   **Retrocompatibilidad Total**: Soporta de forma transparente convenciones históricas (`columns`/`colums`, `foreignKey`/`foreingKey`, `default`/`defaul`).

## 🔌 Adaptadores Disponibles

Para utilizar tus modelos en una base de datos real, instala el adaptador correspondiente:

*   **[mysql-tab](https://github.com/ever23/mysql-tab)**: Para MySQL y MariaDB.
*   **[sqlite3-tab](https://github.com/ever23/sqlite3-tab)**: Para bases de datos SQLite3 locales.
*   **[pg-table](https://github.com/ever23/pg-table)**: Para PostgreSQL.
*   **[mssql-tab](https://github.com/ever23/mssql-tab)**: Para Microsoft SQL Server.
*   **[tauri-sql-tab](https://github.com/ever23/tauri-sql-tab)**: Para aplicaciones de escritorio Tauri con SQLite.

---

## 📦 Instalación

```sh
$ npm install tabla-model
```

---

## 🛠️ Guía de Uso Completa

### 1. Creación de un Modelo Declarativo
Define las columnas, tipos de datos, restricciones y claves foráneas.

```javascript
import tablaModel from "tabla-model";
// O en CommonJS: const tablaModel = require("tabla-model");

const inscripciones = new tablaModel("inscripciones", {
    columns: [ // También soportado como 'colums'
        {
            name: "id_inscripcion",
            type: "integer",
            primary: true,
            autoincrement: true,
            defaultNull: false
        },
        {
            name: "id_alumno",
            type: "varchar(20)",
            defaultNull: false
        },
        {
            name: "id_usuario",
            type: "integer",
            defaultNull: false
        },
        {
            name: "id_materia",
            type: "integer",
            defaultNull: false
        },
        {
            name: "periodo",
            type: "varchar(20)",
            defaultNull: true
        },
        {
            name: "seccion",
            type: "varchar(10)",
            defaultNull: false,
            default: "'01'" // También soportado como 'defaul'
        }
    ]
});

// Definición secuencial de Claves Foráneas (método .foreignKey() o .foreingKey())
inscripciones.foreignKey({
    key: "id_alumno",
    reference: "alumnos",
    keyReference: "cedula",
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

inscripciones.foreignKey({
    key: "id_materia",
    reference: "materias",
    keyReference: "id",
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

export default inscripciones;
```

> [!NOTE]
> **Retrocompatibilidad Garantizada:**  
> Por compatibilidad con proyectos existentes, los nombres tradicionales `colums`, `foreingKey` y `defaul` siguen estando 100% soportados internamente. Puedes usar la convención estándar en inglés (`columns`, `foreignKey`, `default`) o la tradicional de forma indistinta.

---

### 2. Extensión con Métodos de Negocio (`modelo.method`)
Puedes encapsular la lógica de dominio directamente dentro del modelo. Al invocar el método desde la tabla (`db.tabla('inscripciones').getReporteNotas(...)`), `tabla-model` inyecta automáticamente los dos primeros argumentos:
1. `tabla`: La instancia interactiva de `dbTabla` (con Active Record, `select`, `selectOne`, `update`, `delete`, `insert`).
2. `db`: La conexión activa (`Connect`), lo que permite realizar consultas a otras tablas (`db.tabla('alumnos')`, `db.tabla('periodos')`).
3. `...params`: Los argumentos que pases al llamar a la función.

```javascript
inscripciones.method('getReporteNotas', async (tabla, db, options = {}) => {
    const { id_usuario, materia_id, periodo, seccion } = options;

    const where = {};
    if (id_usuario) where["inscripciones.id_usuario"] = id_usuario;
    if (materia_id) where["inscripciones.id_materia"] = materia_id;

    if (periodo) {
        if (periodo.length === 4) {
            // El sufijo '%' indica búsqueda LIKE en dbtabla
            where["inscripciones.periodo%"] = periodo + '%';
        } else {
            where["inscripciones.periodo"] = periodo;
        }
    }
    if (seccion) where["inscripciones.seccion"] = seccion;

    // Sintaxis de Objeto Único (Recomendada)
    return await tabla.select({
        campos: [
            "alumnos.cedula",
            "alumnos.nombres",
            "alumnos.apellidos",
            "materias.nombre as materia_nombre",
            "calificaciones_trimestrales.nota_1"
        ],
        joins: {
            ">alumnos": "inscripciones.id_alumno = alumnos.cedula",
            ">materias": "inscripciones.id_materia = materias.id",
            ">calificaciones_trimestrales": "inscripciones.id_inscripcion = calificaciones_trimestrales.id_inscripcion"
        },
        where,
        order: "alumnos.apellidos ASC"
    });
});
```

---

### 3. Semillas de Datos (Initial Seed)
Define registros por defecto que deben precargarse automáticamente al inicializar la tabla.

```javascript
usuarios.insert({
    id_usuarios: 1,
    user: "root",
    nombre: "Administrador",
    tipo: "root",
    aprobado: "si"
});
```

---

### 4. Uso de Modelos con `dbtabla`

Una vez que defines tus modelos en una carpeta (por ejemplo `./model`), puedes cargarlos de forma automática en tu conexión:

```javascript
import sqlite3Tab from "sqlite3-tab";

const db = new sqlite3Tab(":memory:");

// 1. Cargar todos los modelos de un directorio
db.pathModels("./model");

// O agregar uno individualmente
// db.addModel(inscripcionesModel);

// 2. Usar la tabla con sus métodos de negocio listos
const tablaInscripciones = db.tabla("inscripciones");
const reporte = await tablaInscripciones.getReporteNotas({
    id_usuario: 1,
    periodo: "2026-1",
    seccion: "01"
});
```

---

### 5. Uso con TypeScript

`tabla-model` incluye declaraciones de tipos completas. Puedes parametrizar tus modelos con interfaces tipadas para contar con autocompletado en los nombres de columnas:

```typescript
import tablaModel from "tabla-model";

interface Usuario {
    id_usuarios: number;
    user: string;
    email: string;
    nombre: string;
    tipo: 'root' | 'profesor' | 'alumno';
}

const usuarios = new tablaModel<Usuario>("usuarios", {
    columns: [
        { name: "id_usuarios", type: "integer", primary: true, autoincrement: true, defaultNull: false },
        { name: "user", type: "varchar(45)", defaultNull: false, unique: true },
        { name: "email", type: "varchar(100)", defaultNull: false },
        { name: "nombre", type: "varchar(100)", defaultNull: false },
        { name: "tipo", type: "varchar(15)", defaultNull: false, default: "'profesor'" }
    ]
});

export default usuarios;
```

---

### 6. Atributos Soportados de Columna

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | `string` | Nombre físico de la columna en la tabla. |
| `type` | `string` | Tipo de dato SQL (`integer`, `varchar(N)`, `text`, `datetime`, `decimal`, etc.). |
| `primary` | `boolean` | `true` si forma parte de la clave primaria. |
| `autoincrement` | `boolean` | `true` si es un campo autoincremental. |
| `defaultNull` | `boolean` | `true` si permite valores `NULL`, `false` si es `NOT NULL`. |
| `default` / `defaul` | `any` | Valor por defecto (ej: `0`, `"'01'"`, `"CURRENT_TIMESTAMP"`). |
| `unique` | `boolean` | Restricción de valor único (`UNIQUE`). |

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.

[npm-image]: https://img.shields.io/npm/v/tabla-model.svg
[npm-url]: https://npmjs.org/package/tabla-model
[node-version-image]: https://img.shields.io/node/v/tabla-model.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/tabla-model.svg
[downloads-url]: https://npmjs.org/package/tabla-model
