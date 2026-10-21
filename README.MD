# tabla-model

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

**tabla-model** es el motor central de definición de esquemas y generación de SQL para el ecosistema `dbtabla`. Permite definir la estructura de tus tablas en JavaScript de forma declarativa, permitiendo que tus aplicaciones sean agnósticas al motor de base de datos (MySQL, SQLite, PostgreSQL).

## 🚀 Características Principales

*   **Definición Declarativa**: Estructura tus datos usando objetos de JS limpios y legibles.
*   **Traductor Universal de SQL**: Genera sentencias `CREATE TABLE` optimizadas para diferentes dialectos.
*   **Extensibilidad (Model Methods)**: Inyecta lógica de negocio personalizada directamente en las instancias de tabla.
*   **Gestión de Semillas (Seeds)**: Define datos iniciales que deben existir al crear la tabla.
*   **Ingeniería Inversa**: Convierte sentencias SQL existentes en modelos de JavaScript de forma automática.
*   **Integración Nativa**: Diseñado para trabajar en perfecta armonía con el ecosistema `dbtabla`.

## 🔌 Adaptadores Disponibles

Para utilizar tus modelos en una base de datos real, instala el adaptador correspondiente:

*   **[mysql-tab](https://github.com/ever23/mysql-tab)**: Para MySQL y MariaDB.
*   **[sqlite3-tab](https://github.com/ever23/sqlite3-tab)**: Para bases de datos SQLite3 locales.
*   **[pg-table](https://github.com/ever23/pg-table)**: Para PostgreSQL.

---

## 📦 Instalación

```sh
$ npm install tabla-model
```

---

## 🛠️ Guía de Uso Completa

### 1. Creación de un Modelo Básico
Define las columnas y sus atributos (tipos, claves primarias, unicidad).

```javascript
const Model = require('tabla-model');

const UsuarioModel = new Model('usuarios', {
    columns: [
        { name: 'id', type: 'int', primary: true, autoincrement: true },
        { name: 'username', type: 'varchar(50)', defaultNull: false, unique: true },
        { name: 'email', type: 'varchar(100)' },
        { name: 'puntos', type: 'int', default: 0 }
    ],
    // Definición de Claves Foráneas (Opcional)
    foreignKey: [
        {
            key: 'id_perfil',
            reference: 'perfiles',
            keyReference: 'id',
            onDelete: 'CASCADE'
        }
    ]
});
```

> [!NOTE]
> **Retrocompatibilidad Garantizada:**  
> Por compatibilidad con proyectos existentes, los nombres tradicionales `colums`, `foreingKey` y `defaul` siguen estando 100% soportados internamente. Puedes usar la convención estándar en inglés (`columns`, `foreignKey`, `default`) o la tradicional de forma indistinta.
```

### 2. Extensión con Métodos Personalizados
Puedes agregar métodos de negocio que estarán disponibles directamente en las instancias de la tabla.

**Importante:** Al definir el método, la librería inyecta automáticamente los dos primeros argumentos:
1. `tabla`: La instancia actual de `dbTabla`.
2. `db`: La instancia de la conexión (`Connect`).
3. `...params`: Tus parámetros personalizados.

```javascript
// Agregamos un método con parámetros extra
UsuarioModel.method('getByPuntos', async (tabla, db, minPuntos, limit = 10) => {
    // Usamos 'tabla' para hacer consultas
    return await tabla.select({
        where: `puntos > ${minPuntos}`,
        order: "puntos DESC",
        limit: limit
    });
});

// Luego en tu app (en las rutas o controladores):
// const ranking = await db.tabla('usuarios').getByPuntos(100, 5);
```

### 3. Sintaxis Avanzada de Filtrado (Where Object)
Al realizar consultas mediante objetos (en `select`, `update`, etc.), `dbtabla` soporta operadores especiales:
*   **Sufijos de Comparación:** `campo%` (LIKE), `campo!` (!=), `campo>` (>), `campo<` (<), `campo>=` (>=), `campo<=` (<=).
*   **Prefijos Lógicos:** `||campo` (OR), `&&campo` (AND).

```javascript
// Ejemplo de uso en un método:
UsuarioModel.method('searchActive', async (tabla, db, term) => {
    return await tabla.select({
        where: { "estado": "activo", "||nombre%": term + "%" },
        order: "id DESC"
    });
});
```

> [!IMPORTANT]
> **Nota sobre parámetros en `select`:**
> Si utilizas objetos para el filtrado `where` en la sintaxis posicional, asegúrate de pasar `null` para los parámetros opcionales que le preceden (`campos` y `joins`).
>
> **Sintaxis Recomendada (Objeto Único):**
> Para evitar errores de posición, usa un objeto con llaves explícitas:
> ```javascript
> await tabla.select({ where: { activo: 1 }, order: "id DESC" });
> ```

### 4. Semillas de Datos (Initial Seed)
Ideal para configurar datos maestros o usuarios administradores por defecto.

```javascript
UsuarioModel.insert({ id: 1, username: 'root', email: 'admin@system.local', puntos: 999 });
UsuarioModel.insert({ id: 2, username: 'tester', email: 'test@system.local' });
```

### 4. Generación de SQL
Obtén el código SQL necesario para crear la tabla manualmente si lo necesitas.

```javascript
// SQL para MySQL
console.log(UsuarioModel.sql());

// SQL para SQLite (usando escape de comillas simples)
console.log(UsuarioModel.sql({ typeDB: 'sqlite' }));
```

---

## 🔄 Ingeniería Inversa (SQL a Modelo)

Si ya tienes un `CREATE TABLE` en SQL, `tabla-model` puede transformarlo en un objeto de modelo.

```javascript
const sql = "CREATE TABLE productos (id INT PRIMARY KEY, nombre VARCHAR(100))";
const productos = new Model(sql);

// Exportar el modelo generado a un archivo .js
productos.saveModel('./model/productos.js');
```

---

## 💎 Referencia de Atributos de Columna

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | `String` | Nombre físico de la columna en la DB. |
| `type` | `String` | Tipo de dato SQL (ej: `int`, `varchar(255)`, `text`, `datetime`). |
| `primary` | `Boolean` | `true` si la columna es parte de la clave primaria. |
| `autoincrement`| `Boolean` | `true` si es un campo autoincremental. |
| `defaultNull` | `Boolean` | Indica si permite valores `NULL`. |
| `default` | `Any` | Valor por defecto (soporta `CURRENT_TIMESTAMP`). |
| `unique` | `Boolean` | Aplica una restricción de valor único. |

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.

[npm-image]: https://img.shields.io/npm/v/tabla-model.svg
[npm-url]: https://npmjs.org/package/tabla-model
[node-version-image]: https://img.shields.io/node/v/tabla-model.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/tabla-model.svg
[downloads-url]: https://npmjs.org/package/tabla-model
