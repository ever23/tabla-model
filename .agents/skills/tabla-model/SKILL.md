# tabla-model AI Skill (Definición de Esquemas SQL)

Esta skill define las instrucciones para que un agente de IA utilice **tabla-model** como el estándar de definición de datos. Al seguir estos patrones, garantizas que las tablas se generen con los tipos correctos y que las librerías de conexión (`mysql-tab`, `sqlite3-tab`, etc.) puedan interpretar el esquema automáticamente.

## 1. Estructura de Definición de un Modelo

Cada modelo debe definirse en un archivo independiente dentro de una carpeta `/model`.

```javascript
const Model = require('tabla-model');

/**
 * Los modelos actúan como la fuente de verdad de la estructura de la DB.
 */
const UsuarioModel = new Model('usuarios', {
    columns: [ // También soportado como colums
        { 
            name: 'id', 
            type: 'int', 
            primary: true, 
            autoincrement: true 
        },
        { 
            name: 'username', 
            type: 'varchar(50)', 
            defaultNull: false, 
            unique: true 
        },
        { 
            name: 'email', 
            type: 'varchar(100)' 
        },
        { 
            name: 'puntos', 
            type: 'int', 
            default: 0 
        }
    ],
    // Definición de Claves Foráneas (Opcional)
    foreignKey: [ // También soportado como foreingKey
        {
            key: 'id_perfil',
            reference: 'perfiles',
            keyReference: 'id',
            onDelete: 'CASCADE'
        }
    ]
});

module.exports = UsuarioModel;
```

## 2. Inyección de Métodos Personalizados

Puedes extender la funcionalidad de una tabla agregando métodos de negocio. Al invocar un método personalizado, la librería inyecta automáticamente los dos primeros argumentos:
1. `tabla`: La instancia actual de `dbTabla`.
2. `db`: La instancia de la conexión (`Connect`).
3. `...args`: Parámetros adicionales pasados por el usuario.

```javascript
// Agregamos un método con parámetros extra
UsuarioModel.method('getRanking', async (tabla, db, limit = 10) => {
    // db permite ejecutar queries directas si es necesario
    return await tabla.select({
        where: "puntos > 0",
        order: "puntos DESC",
        limit: limit
    });
});

// Uso posterior:
// const top5 = await db.tabla('usuarios').getRanking(5);
```

## 3. Semillas de Datos (Initial Seed)

Puedes pre-cargar datos que se insertarán automáticamente cuando la tabla se cree por primera vez.

```javascript
UsuarioModel.insert({ id: 1, username: 'root', email: 'admin@local' });
UsuarioModel.insert({ id: 2, username: 'user1', email: 'user1@local' });
```

## 4. Ingeniería Inversa (SQL a Modelo)

Si recibes una sentencia SQL de creación, puedes convertirla a un modelo para analizarla o replicarla.

```javascript
const sql = "CREATE TABLE logs (id INT PRIMARY KEY, log TEXT)";
const logsModel = new Model(sql);
console.log(logsModel.getData()); // Retorna el objeto estructurado
```

## 5. Directrices Críticas para la IA

> [!IMPORTANT]
> Reglas de Oro para Agentes:
> 
> 1.  **Tipos de Datos**: Usa tipos de datos SQL estándar (`int`, `varchar(N)`, `text`, `datetime`). Los adaptadores se encargarán de traducirlos si es necesario.
> 2.  **Exportación**: Exporta siempre la instancia de `new Model(...)` para que pueda ser consumida por `db.addModel()` o `db.pathModels()`.
> 3.  **Consistencia**: Antes de realizar una consulta, verifica siempre el archivo de modelo correspondiente para asegurar que los nombres de las columnas coincidan.
> 4.  **Métodos**: Prefiere usar `.method()` para encapsular lógica de negocio compleja que dependa exclusivamente de esa tabla.
> 5.  **Orden de Parámetros**: Al definir un método, respeta siempre el orden `(tabla, db, ...misParams)`. No asumas que tu primer parámetro es el que pasas en la llamada; es el tercero.

## 6. Referencia de Atributos de Columna
- `name`: Nombre físico de la columna.
- `type`: Tipo de dato (ej: `varchar(20)`, `integer`).
- `primary`: `true` si es PK.
- `autoincrement`: `true` si es AI.
- `defaultNull`: `true` si permite nulos.
- `default`: Valor por defecto (ej: `'activo'`, `0`, `'CURRENT_TIMESTAMP'`).
- `unique`: `true` para restricción de unicidad.

## 7. Sintaxis Avanzada de Filtrado (Where Object)

Al utilizar objetos para la cláusula `where` en métodos como `select`, `update` o `delete`, puedes usar operadores especiales:

### Operadores de Comparación (Sufijos)
Añade estos caracteres al final del nombre del campo:
- `campo%`: Genera `LIKE 'valor'`.
- `campo!`: Genera `!= 'valor'`.
- `campo>` / `campo<`: Genera `>` / `<`.
- `campo>=` / `campo<=`: Genera `>=` / `<=`.

### Operadores Lógicos (Prefijos)
Añade estos caracteres al inicio del nombre del campo:
- `||campo`: Cambia el operador a `OR`.
- `&&campo`: Asegura el operador `AND` (por defecto).

### Nota sobre Cadenas Numéricas (Ceros a la izquierda)
La librería detecta automáticamente si un string es un número. Sin embargo, si el string comienza con `0` seguido de dígitos (ej: `"01"`, `"007"`), **se tratará siempre como un string** (con comillas) para preservar códigos, secciones o identificadores especiales.

> **Peligro de Parámetros:**
> Debido al polimorfismo, si pasas un objeto en la primera posición de `select()`, se interpretará como una definición de **Joins**. Para filtrar por objeto de forma segura:
> `await tabla.select(null, null, { "campo": "valor" });`
>
> **Sintaxis Recomendada (Objeto Único):**
> La forma más segura es usar un objeto con llaves explícitas, lo cual anula el peligro del polimorfismo:
> `await tabla.select({ where: { activo: 1 }, order: "id DESC" });`
