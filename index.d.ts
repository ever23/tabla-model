/**
 * Declaraciones de tipos TypeScript para tabla-model
 */

export type ColumnSqlType =
    | 'int'
    | 'integer'
    | 'tinyint'
    | 'smallint'
    | 'bigint'
    | 'varchar'
    | 'char'
    | 'text'
    | 'longtext'
    | 'mediumtext'
    | 'boolean'
    | 'bool'
    | 'date'
    | 'datetime'
    | 'timestamp'
    | 'time'
    | 'float'
    | 'double'
    | 'decimal'
    | 'numeric'
    | 'json'
    | 'blob'
    | (string & {});

export interface ColumnDefinition<T = Record<string, any>> {
    name: (keyof T & string) | string;
    type: ColumnSqlType;
    primary?: boolean;
    autoincrement?: boolean;
    unique?: boolean;
    defaultNull?: boolean;
    /** Valor por defecto (recomendado) */
    default?: any;
    /** Valor por defecto (retrocompatibilidad) */
    defaul?: any;
}

export interface ForeignKeyDefinition {
    key: string | string[];
    reference: string;
    keyReference: string | string[];
    match?: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'RESTRICT' | string;
    onUpdate?: 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'RESTRICT' | string;
}

export interface ModelParams<T = Record<string, any>> {
    /** Lista de columnas del modelo (recomendado) */
    columns?: ColumnDefinition<T>[];
    /** Lista de columnas del modelo (retrocompatibilidad) */
    colums?: ColumnDefinition<T>[];
    /** Claves foráneas (recomendado) */
    foreignKey?: ForeignKeyDefinition[];
    /** Claves foráneas (retrocompatibilidad) */
    foreingKey?: ForeignKeyDefinition[];
    foreignkeys?: ForeignKeyDefinition[];
}

export class sqlTablaModel<T = Record<string, any>> {
    tabla: string;

    constructor(tableName: string, params?: ModelParams<T> | ColumnDefinition<T>[] | string);

    /**
     * Inyecta un método de negocio personalizado en las instancias de la tabla.
     * La función recibe automáticamente (tabla, db, ...tusParametros).
     */
    method(name: string, callback: (tabla: any, db: any, ...params: any[]) => any): void;

    /**
     * Retorna los metadatos estructurados del modelo
     */
    getData(): {
        tabla: string;
        columns: ColumnDefinition<T>[];
        colums: ColumnDefinition<T>[];
        foreignKey: ForeignKeyDefinition[];
        foreingKey: ForeignKeyDefinition[];
        init: any[];
        methods: Record<string, Function>;
    };

    /**
     * Agrega una columna al modelo
     */
    column(coll: ColumnDefinition<T>): void;
    colum(coll: ColumnDefinition<T>): void;

    /**
     * Agrega o consulta claves foráneas
     */
    foreignKey(key?: ForeignKeyDefinition): ForeignKeyDefinition[] | void;
    foreingKey(key?: ForeignKeyDefinition): ForeignKeyDefinition[] | void;

    /**
     * Define datos iniciales (semillas) para la tabla
     */
    insert(data: Partial<T> | Record<string, any>): void;
    insert(...params: any[]): void;

    /**
     * Genera la sentencia SQL CREATE TABLE para el modelo
     */
    sql(config?: any): string;

    /**
     * Genera la sentencia SQL ALTER TABLE ADD COLUMN para una columna
     */
    sqlAddColumn(coll: ColumnDefinition<T>, config?: any): string;

    /**
     * Guarda el modelo en un archivo de JavaScript
     */
    saveModel(file: string): void;

    static MYSQL_DB: string;
    static POSTGRESQL_DB: string;
    static SQLITE3_DB: string;
    static SQLSERVER_DB: string;
}

export default sqlTablaModel;
