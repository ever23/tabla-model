# tabla-model AI Skill (Definición de Esquemas SQL)

Esta skill define las instrucciones para que un agente de IA utilice **tabla-model** como el estándar de definición de esquemas, relaciones y métodos de dominio.

## 1. Estructura Canónica de Definición de un Modelo

Cada modelo debe definirse en un archivo independiente dentro de una carpeta `/model`.

```javascript
import tablaModel from "tabla-model";
// O CommonJS: const tablaModel = require('tabla-model');

/**
 * Los modelos actúan como la fuente de verdad del esquema y lógica de negocio.
 */
const inscripciones = new tablaModel("inscripciones", {
    columns: [ // Soportado como 'columns' (recomendado) o 'colums' (retrocompatibilidad)
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
            default: "'01'" // Soportado como 'default' o 'defaul'
        }
    ]
});

// Definición de Claves Foráneas (método .foreignKey() o .foreingKey())
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
// O module.exports = inscripciones;
```

---

## 2. Inyección de Métodos de Negocio (`modelo.method`)

Al invocar un método registrado con `.method()`, `dbtabla` inyecta automáticamente los dos primeros argumentos:
1. `tabla`: La instancia actual de `dbTabla`.
2. `db`: La conexión activa (`Connect`), permitiendo consultar tablas cruzadas.
3. `...args`: Argumentos adicionales pasados al invocar la función.

> [!IMPORTANT]
> **REGLA DE ORO DE CONSULTAS**: En los métodos de negocio, utiliza SIEMPRE la **Sintaxis de Objeto Único** (`{ campos, joins, where, order, limit }`) para consultas legibles y libres de errores posicionales.

```javascript
inscripciones.method('getReporteNotas', async (tabla, db, options = {}) => {
    const { id_usuario, materia_id, periodo, seccion } = options;

    const where = {};
    if (id_usuario) where["inscripciones.id_usuario"] = id_usuario;
    if (materia_id) where["inscripciones.id_materia"] = materia_id;

    if (periodo) {
        if (periodo.length === 4) {
            where["inscripciones.periodo%"] = periodo + '%'; // LIKE
        } else {
            where["inscripciones.periodo"] = periodo;
        }
    }
    if (seccion) where["inscripciones.seccion"] = seccion;

    // Sintaxis de Objeto Único recomendada
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

## 3. Semillas de Datos Iniciales (Initial Seed)

Puedes precargar registros iniciales necesarios:

```javascript
usuarios.insert({ 
    id_usuarios: 1, 
    user: "root", 
    nombre: "Administrador", 
    tipo: "root" 
});
```

---

## 4. Uso con TypeScript

```typescript
import tablaModel from "tabla-model";

interface Inscripcion {
    id_inscripcion: number;
    id_alumno: string;
    id_usuario: number;
    id_materia: number;
    periodo?: string;
    seccion: string;
}

const inscripciones = new tablaModel<Inscripcion>("inscripciones", {
    columns: [
        { name: "id_inscripcion", type: "integer", primary: true, autoincrement: true, defaultNull: false },
        { name: "id_alumno", type: "varchar(20)", defaultNull: false },
        { name: "id_usuario", type: "integer", defaultNull: false },
        { name: "id_materia", type: "integer", defaultNull: false },
        { name: "periodo", type: "varchar(20)", defaultNull: true },
        { name: "seccion", type: "varchar(10)", defaultNull: false, default: "'01'" }
    ]
});

export default inscripciones;
```

---

## 5. Directrices Críticas para la IA

1. **Prioridad Sintáctica**: En los métodos del modelo (`modelo.method`), utiliza SIEMPRE Sintaxis de Objeto Único (`select({ campos, joins, where, order, limit })` y `selectOne({ where: ... })`).
2. **Consultas Cruzadas**: Usa `db.tabla('otra_tabla')` dentro de `.method()` para interactuar con tablas relacionadas de manera segura.
3. **Filtros Where**: Emplea los sufijos de comparación (`campo%` para LIKE, `campo>` para mayor que) y prefijos lógicos (`||campo` para OR).
4. **Retrocompatibilidad**: Respeta tanto `columns` como `colums`, `foreignKey` como `foreingKey`, y `default` como `defaul`.
