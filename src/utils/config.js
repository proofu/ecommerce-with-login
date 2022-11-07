import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const configSqlite = {
  db: {
    client: "better-sqlite3",
    connection: {
      filename: path.join(__dirname, "../../DB/mensajes.db3"),
    },
    useNullAsDefault: true,
  },
};

export const configMysql = {
  db: {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "admin",
      password: "adminpass",
      database: "clase16desafio",
    },
  },
};
export const mongoDb = {
  host: "localhost",
  port: 27017,
  dbName: "usuarios",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  },
};
