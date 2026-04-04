# tabla-model

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

Módulo para la definición de modelos de datos SQL en JavaScript, permitiendo la conversión bidireccional entre representaciones de objetos y sentencias SQL.

## Tabla de contenidos

- [Instalación](#instalación)
- [Introducción](#introducción)
- [Drivers Soportados](#drivers-soportados)
- [Uso](#uso)
- [Documentación del API](#documentación-del-api)

## Instalación

`tabla-model` es un módulo para [Node.js](https://nodejs.org/) disponible a través del registro de [npm](https://www.npmjs.com/).

Para instalarlo, ejecute el siguiente comando:

```sh
$ npm install tabla-model
```

## Introducción

`tabla-model` permite crear representaciones abstractas de tablas SQL mediante modelos de datos en JavaScript. Estos modelos pueden ser utilizados para generar código SQL de creación de tablas o para reconstruir modelos a partir de sentencias SQL existentes.

## Drivers Soportados

Este ecosistema cuenta con varios adaptadores de alto nivel que integran `tabla-model` para diferentes motores de bases de datos:

- **[mysql-tab](https://github.com/ever23/mysql-tab)**: Controlador de alto nivel para MySQL.
- **[pg-table](https://github.com/ever23/pg-table)**: Controlador de alto nivel para PostgreSQL.
- **[sqlite3-tab](https://github.com/ever23/sqlite3-tab)**: Controlador de alto nivel para SQLite3.

## Uso

Para utilizar `tabla-model`, basta con instanciar la clase principal y definir las columnas y restricciones de la tabla.

### Ejemplo básico:

```js
// archivo ./model/test1.js
const Model = require("tabla-model");

const test1 = new Model("test3", [
    {
        name: "id",
        type: "int",
        primary: true,
        autoincrement: true
    },
    {
        name: "row1",
        type: "text"
    },
    {
        name: "row2",
        type: "int",
    },
    {
        name: "row3",
        type: "date",
    }
]);

test1.foreingKey({ // Definición de claves foráneas
    key: "row2",
    reference: "test4",
    keyReference: "id_key2",
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION'
});

console.log(test1.sql());
```

---

## Documentación del API

### `sqlModel#constructor(tabla, config)`
Constructor de la clase.

* `tabla {string}`: Nombre de la tabla o una sentencia SQL completa (`CREATE TABLE`). Si se proporciona una sentencia SQL, el modelo se extraerá automáticamente de ella.
* `config {object|array}`: 
    * Si el primer parámetro es el nombre de la tabla, este puede ser un objeto con el formato `{colums: Array, foreingKey: Array}` o simplemente un `Array` de columnas.
    * Si el primer parámetro es una sentencia SQL `CREATE TABLE`, este parámetro indicará el carácter de escape SQL.

#### Ejemplo con objeto de configuración:
```js
const Model = require("tabla-model");
const test1 = new Model("test3", {
    colums: [
        { name: "id", type: "int", primary: true, autoincrement: true },
        { name: "row1", type: "text" },
        { name: "row2", type: "int" },
        { name: "row3", type: "date" }
    ],
    foreingKey: [
        {
            key: "row2",
            reference: "test4",
            keyReference: "id_key2",
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        }
    ]
});
```

#### Ejemplo a partir de SQL:
```js
const Model = require("tabla-model");
const test1 = new Model(`CREATE TABLE test1 (
    id int NOT NULL AUTO_INCREMENT,
    row1 text,
    row2 int,
    row3 date,
    PRIMARY KEY (id),
    FOREIGN KEY (row2) REFERENCES test4(id_key2)
    ON UPDATE CASCADE
    ON DELETE NO ACTION
)`);
```

### `sqlModel#colum(coll)`
Agrega una columna al modelo.

* `coll {object}`: Objeto con la definición de la columna.
```js
{
    name: String,        // Nombre de la columna
    type: String,        // Tipo de dato según el motor de DB
    defaultNull: Boolean,// (Opcional) permite valores nulos si es true
    primary: Boolean,    // (Opcional) define si es clave primaria
    unique: Boolean,     // (Opcional) define si es un índice único
    defaul: String       // (Opcional) valor por defecto
}
```

### `sqlModel#foreingKey(key)`
Agrega una clave foránea al modelo.

* `key {object}`: Objeto con la definición de la clave foránea.
```js
{
    key: String|Array,          // Campo(s) locales de la clave foránea
    reference: String,          // Tabla de referencia
    keyReference: String|Array, // Campo(s) en la tabla referenciada
    match: String,              // (Opcional) tipo de coincidencia
    onDelete: String,           // Acción al borrar (CASCADE, NO ACTION, etc.)
    onUpdate: String            // Acción al actualizar
}
```

### `sqlModel#insert(...params)`
Agrega datos para la inicialización de la tabla.

* `...params`: Los datos se pueden pasar de forma individual, como una lista de argumentos, o dentro de un único array.

### `sqlModel#method(name, callback)`
Extiende el modelo agregando un método personalizado.

* `name {string}`: Nombre del método.
* `callback {function}`: Función que se ejecutará al llamar al método.

### `sqlModel#getData()`
Retorna un objeto con la estructura completa del modelo.
```js
{
    tabla: String,      // Nombre de la tabla
    colums: Array,      // Definición de columnas
    foreingKey: Array,  // Claves foráneas
    init: Array,        // Datos de inicialización
    methods: Object     // Métodos personalizados
}
```

### `sqlModel#sql(config)`
Genera y retorna la sentencia SQL necesaria para crear la tabla representada por el modelo.

* `config {object}`: Configuración opcional para el generador SQL (caracteres de escape, prefijos, etc.).
```js
{
    escapeChar: String,
    reserveIdentifiers: Array,
    dbprefix: String
}
```

### `sqlModel#saveModel(file)`
Crea un archivo JavaScript con la definición del modelo para ser reutilizado.

* `file {string}`: Ruta del archivo donde se guardará el modelo.

[npm-image]: https://img.shields.io/npm/v/tabla-model.svg
[npm-url]: https://npmjs.org/package/tabla-model
[node-version-image]: https://img.shields.io/node/v/tabla-model.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/tabla-model.svg
[downloads-url]: https://npmjs.org/package/tabla-model
