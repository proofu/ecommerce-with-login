import knex from "knex";
import { configSqlite } from "../utils/config.js";

const knexCli = knex(configSqlite.db);

knexCli.schema.dropTableIfExists('mensajes')
    .then(()=>{
        knexCli.schema.createTable('mensajes', table => {
            table.string('author', 50).notNullable();
            table.string('text', 140).unsigned().notNullable();
            table.string('timestamp', 50).notNullable();
        })
            .then(()=> console.log("Tabla de mensajes creada"))
            .catch(err=> {
                console.log(err); 
                throw err;
            })
            .finally(()=>{
                knexCli.destroy();
            });
    });