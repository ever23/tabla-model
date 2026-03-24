const { describe, it } = require('node:test');
describe("test de tabla-model",()=>
{
    require("./sqlHelpers")
    require("./sql2Model")
    require("./model2Sql")
    require("./sqlTablaModel")
    require("./createModel")
    
})