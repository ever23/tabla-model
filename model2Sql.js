const sqlHelpers = require("./sqlHelpers")

/**
* model2Sql
* convierte un objeto de modelo en sql nesesario para crear la tabla que representa 
*
*/
class model2Sql {
    #model
    #helpers
    #typeDB

    /**
    * @param {dbTablaModel} model - modelo a convertir 
    * @param {object} helper - configuraciones para el helper 
    */
    constructor(model, helper) {
        this.#model = model
        this.#helpers = new sqlHelpers(helper)
        this.#typeDB = helper.typeDB
    }
    /**
    * crea una columna en sql 
    * @param {object} colum - {name:string, type:string, efaultNull:boolean, primary:boolean, unique:bolean, defaul:string}
    * @return {string}
    */
    #colums(colum) {
        // 1. Guardamos el tipo en una variable temporal en lugar de mutar el objeto
        let columType = colum.type

        if (this.#typeDB === sqlHelpers.POSTGRESQL_DB && colum.autoincrement) {
            columType = "serial" // 2. Mutamos la variable temporal
        }

        let sql = `${this.#helpers.protectIdentifiers(colum.name)} ${columType}`
        if (colum.defaultNull !== undefined)
            if (colum.defaultNull) {
                sql += " NULL"
            } else {
                sql += " NOT NULL"
            }
        if (colum.primary && !colum.defaultNull) {
            sql += " NOT NULL"
        }
        if (colum.default !== undefined) {
            sql += ` DEFAULT ${colum.default}`
        }
        if (colum.autoincrement && this.#typeDB === sqlHelpers.MYSQL_DB) {
            sql += " AUTO_INCREMENT"
        }
        return sql
    }
    /**
    * crea las claves primarias en sql 
    * @params {array} keys - nombre de las claves primarias 
    * @return {string}
    */
    #primaryKeys(keys) {
        let colums = this.#helpers.protectIdentifiers(keys).join(",")
        return `PRIMARY KEY (${colums})`
    }
    /**
    * crea las claves unicas en sql 
    * @params {array} keys - nombre de las claves unicas 
    * @return {string}
    */
    #uniqueKeys(keys) {
        let colums = this.#helpers.protectIdentifiers(keys).join(",")
        return `UNIQUE (${colums})`
    }
    /**
    * crea los indices en sql 
    * @params {array} keys - nombre de los indices
    * @return {string}
    */
    #indexKey(keys) {
        let colums = this.#helpers.protectIdentifiers(keys).join(",")
        return `INDEX (${colums})`
    }
    /**
    * crea una clave foranea en sql 
    * @param {string} tabla - nombre de la tabla 
    * @param {object} keys - clave foranea { key:string|array, reference:string, keyReference:string|array, match:string, onDelete:string, onUpdate:string}
    * @return {string}
    */
    #foreingKey(tabla, keys, numero) {
        let keyReference = "", key = ""
        if (keys.keyReference instanceof Array) {
            keyReference = this.#helpers.protectIdentifiers(keys.keyReference).join(",")
        } else {
            keyReference = this.#helpers.protectIdentifiers(keys.keyReference)
        }
        if (keys.key instanceof Array) {
            key = this.#helpers.protectIdentifiers(keys.key).join(",")
        } else {
            key = this.#helpers.protectIdentifiers(keys.key)
        }
        let constrait = this.#helpers.protectIdentifiers(`m2s_${tabla}_${keys.reference}_${numero}`)
        let sql = `CONSTRAINT ${constrait} FOREIGN KEY (${key}) REFERENCES ${this.#helpers.protectIdentifiers(keys.reference)} (${keyReference})`
        if (keys.match !== undefined) {
            sql += ` MATCH ${keys.match}`
        }
        if (keys.onUpdate !== undefined) {
            sql += ` ON UPDATE ${keys.onUpdate}`
        }
        if (keys.onDelete !== undefined) {
            sql += ` ON DELETE ${keys.onDelete}`
        }
        return sql
    }
    /**
    * crea el sql nesesario para crea una tabla 
    * @param {object} data - {tabla:string, colums:array, foreingKey:array}
    * @return {string}
    */
    #cerateTable(data) {

        let colums = [],
            primary = [],
            unique = [],
            index = []

        for (let colum of data.colums) {
            colums.push(this.#colums(colum))
            if (colum.primary !== undefined && colum.primary)
                primary.push(colum.name)
            if (colum.unique !== undefined && colum.unique)
                unique.push(colum.name)
        }

        if (primary.length > 0) {
            colums.push(this.#primaryKeys(primary))
        }
        if (unique.length > 0) {
            colums.push(this.#uniqueKeys(unique))
        }
        if (this.#typeDB === sqlHelpers.MYSQL_DB) {
            for (let keys of data.foreingKey) {
                if (keys.key instanceof Array) {
                    for (let i of keys.key)
                        index.push(i)
                } else {
                    index.push(keys.key)
                }
            }

            if (index.length > 0)
                colums.push(this.#indexKey(index))
        }

        let i = 1
        for (let keys of data.foreingKey)
            colums.push(this.#foreingKey(data.tabla, keys, i++))
        return `CREATE TABLE ${this.#helpers.protectIdentifiers(data.tabla)} (${colums.join(",")});`
    }
    /**
    * crea el sql nesesario para crea la tabla asociada al modelo pasado al constructor 
    * 
    * @return {string}
    */
    sql() {
        return this.#cerateTable(this.#model.getData())
    }
}

module.exports = model2Sql
