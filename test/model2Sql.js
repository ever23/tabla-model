const { describe, it } = require('node:test');
const assert= require("assert")
const model2Sql= require("../model2Sql")

const {MYSQL_DB,POSTGRESQL_DB,SQLITE3_DB} = require("../sqlHelpers")
describe("Test de la clase model2Sql",()=>
{

    it("verificacion de metodos",()=>
    {
        let config={
            escapeChar:"`",
            escapeString:e=>e
        }
        let sql=new model2Sql(require("./model/test1"),config)
        assert.equal(typeof sql.sql,"function")
    })

    it("metodo sql POSTGRESQL_DB",()=>
    {
        let config={
            escapeChar:"\"",
            escapeString:e=>e,
            typeDB:POSTGRESQL_DB
        }

        let result_pg="CREATE TABLE \"test1\" (\"id\" serial NOT NULL,"
        +"\"row1\" text,"
        +"\"row2\" int,"
        +"\"row3\" date,"
        +"PRIMARY KEY (\"id\"),"
        +"CONSTRAINT \"m2s_test1_test2_1\" FOREIGN KEY (\"row2\") REFERENCES "
        +"\"test2\" (\"id_key2\") ON UPDATE CASCADE ON DELETE NO ACTION);"
        assert.equal((new model2Sql(require("./model/test1"),config)).sql(),result_pg,"error en postgre")
    })
    it("metodo sql MYSQL_DB",()=>
    {
        let config={
            escapeChar:"`",
            escapeString:e=>e,
            typeDB:MYSQL_DB
        }
        let result_mysql="CREATE TABLE `test1` (`id` int NOT NULL AUTO_INCREMENT,"
        +"`row1` text,"
        +"`row2` int,"
        +"`row3` date,"
        +"PRIMARY KEY (`id`),"
        +"INDEX (`row2`),"
        +"CONSTRAINT `m2s_test1_test2_1` FOREIGN KEY (`row2`) REFERENCES "
        +"`test2` (`id_key2`) ON UPDATE CASCADE ON DELETE NO ACTION);"
        assert.equal((new model2Sql(require("./model/test1"),config)).sql(),result_mysql,"error en mysql")
    })
    it("metodo sql SQLITE3_DB",()=>
    {
        let config={
            escapeChar:"",
            escapeString:e=>e,
            typeDB:SQLITE3_DB
        }
        let result_sqlite="CREATE TABLE test1 (id INTEGER PRIMARY KEY AUTOINCREMENT,"
        +"row1 text,"
        +"row2 int,"
        +"row3 date,"
        +"CONSTRAINT m2s_test1_test2_1 FOREIGN KEY (row2) REFERENCES "
        +"test2 (id_key2) ON UPDATE CASCADE ON DELETE NO ACTION);"
        assert.equal((new model2Sql(require("./model/test1"),config)).sql(),result_sqlite,"error en sqlite")
    })
})
