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
    colums: [
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
    foreingKey: [
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

Puedes extender la funcionalidad de una tabla agregando métodos que estarán disponibles en la instancia de `dbTabla`.

```javascript
// Agregamos un método para buscar usuarios activos
UsuarioModel.method('getActivos', async (tabla, conexion) => {
    return await tabla.select("estado = 'activo'");
});

// Uso posterior:
// const activos = await db.tabla('usuarios').getActivos();
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

## 6. Referencia de Atributos de Columna
- `name`: Nombre físico de la columna.
- `type`: Tipo de dato (ej: `varchar(20)`, `integer`).
- `primary`: `true` si es PK.
- `autoincrement`: `true` si es AI.
- `defaultNull`: `true` si permite nulos.
- `default`: Valor por defecto (ej: `'activo'`, `0`, `'CURRENT_TIMESTAMP'`).
- `unique`: `true` para restricción de unicidad.
