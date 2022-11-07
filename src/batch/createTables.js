import knex from "knex";
import { configMysql } from "../utils/config.js";

const knexCli = knex(configMysql.db);

knexCli.schema.dropTableIfExists('productos')
    .then(()=>{
        knexCli.schema.createTable('productos', table => {
            table.increments('id').primary();
            table.string('name', 50).notNullable();
            table.integer('price').unsigned().notNullable();
            table.string('thumbnail', 50).notNullable();
        })
            .then(()=> console.log("Tabla de productos creada"))
            .catch(err=> {
                console.log(err); 
                throw err;
            })
            .finally(()=>{
                knexCli.destroy();
            });
    });