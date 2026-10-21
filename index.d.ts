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

export interface ColumnDefinition {
    name: string;
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

export interface ModelParams {
    /** Lista de columnas del modelo (recomendado) */
    columns?: ColumnDefinition[];
    /** Lista de columnas del modelo (retrocompatibilidad) */
    colums?: ColumnDefinition[];
    /** Claves foráneas (recomendado) */
    foreignKey?: ForeignKeyDefinition[];
    /** Claves foráneas (retrocompatibilidad) */
    foreingKey?: ForeignKeyDefinition[];
    foreignkeys?: ForeignKeyDefinition[];
}

export class sqlTablaModel {
    tabla: string;

    constructor(tableName: string, params?: ModelParams | ColumnDefinition[] | string);

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
        columns: ColumnDefinition[];
        colums: ColumnDefinition[];
        foreignKey: ForeignKeyDefinition[];
        foreingKey: ForeignKeyDefinition[];
        init: any[];
        methods: Record<string, Function>;
    };

    /**
     * Agrega una columna al modelo
     */
    column(coll: ColumnDefinition): void;
    colum(coll: ColumnDefinition): void;

    /**
     * Agrega o consulta claves foráneas
     */
    foreignKey(key?: ForeignKeyDefinition): ForeignKeyDefinition[] | void;
    foreingKey(key?: ForeignKeyDefinition): ForeignKeyDefinition[] | void;

    /**
     * Define datos iniciales (semillas) para la tabla
     */
    insert(...params: any[]): void;

    /**
     * Genera la sentencia SQL CREATE TABLE para el modelo
     */
    sql(config?: any): string;

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
