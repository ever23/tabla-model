/**
* tabla test1
* Tue May 05 2026 22:27:06 GMT-0400 (hora de Venezuela)
*/
const tablaModel = require("tabla-model")
const test1=new tablaModel("test1",{
    colums:[
        {
            name:"id",
            type:"int",
            primary:true,
            autoincrement:true,
        },
        {
            name:"row1",
            type:"text",
        },
        {
            name:"row2",
            type:"int",
        },
        {
            name:"row3",
            type:"date",
        }
    ],
    foreingKey:[
        {
            key:"row2",
            reference:"test2",
            keyReference:"id_key2",
            onUpdate:"CASCADE",
        }
    ]
})
test1.insert(1,"eever",34234,"23/10/95")
module.exports = test1