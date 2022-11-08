/* __________________ MODULOS */
import express from "express";
import hbs from "express-handlebars";
import path from "path";
import morgan from "morgan";
import * as http from "http";
import * as IO from "socket.io";
import {
  productosDao as apiProductos,
  mensajesDao as apiMensajes,
} from "./src/DAOs/index.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
const LocalStrategy = Strategy;
import session from "express-session";
import UsuariosDaoMongoDB from "./src/DAOs/usuarios/usuariosDaoMongoDB.js";
const usuariosApi = new UsuariosDaoMongoDB();
import minimist from "minimist";
import cluster from "cluster";
import os from "os";

/* __________________ INSTANCIA DE SERVER */
const app = express();
const httpServer = new http.Server(app);
const io = new IO.Server(httpServer);

/* __________________ MIDDLEWARES */
app.use(express.static("./public"));
app.use(express.urlencoded({ encoded: true, extended: true }));
app.use(morgan("dev"));
app.use(express.json());

// passport
passport.use(
  new LocalStrategy(async function (nombre, password, done) {
    console.log(`${nombre} ${password}`);
    //Logica para validar si un usuario existe
    // const existeUsuario = await usuariosApi.getAll().find(
    //   (usuario) => usuario.nombre == nombre
    // );
    const existeUsuario = await usuariosApi.findOneByName(nombre);

    console.log(existeUsuario);

    if (!existeUsuario) {
      return done(null, false);
    } else {
      const match = await verifyPass(existeUsuario, password);
      if (!match) {
        return done(null, false);
      }

      return done(null, existeUsuario);
    }
  })
);
passport.serializeUser((usuario, done) => {
  done(null, usuario.nombre);
});

passport.deserializeUser((nombre, done) => {
  const existeUsuario = usuariosApi.findOneByName(nombre);
  done(null, existeUsuario);
});

/*----------- Session -----------*/
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 20000, //20 seg
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ____________________DB usuarios */
let usuariosDB = [];

//Metodos de Auth
async function generateHashPassword(password) {
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
}
async function verifyPass(usuario, password) {
  const match = await bcrypt.compare(password, usuario.password);
  console.log(`pass login: ${password} || pass hash: ${usuario.password}`);
  return match;
}

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

/* __________________ MINIMIST */

let options = { default: { PORT: 8080 } };
let argsSliced = minimist(process.argv.slice(2), options);
let args = minimist(process.argv, options);
let pathArg = args._[0];
let pathProject = args._[1];

/* __________________ PROCESS */
let so = process.platform;
let processID = process.pid;
let version = process.version;
let memoriaRSS = process.memoryUsage().rss;

/* __________________ MOTOR DE PLANTILLAS */
app.set("views", "./views");
app.engine(
  "hbs",
  hbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    extname: "hbs",
  })
);
app.set("view engine", "hbs");

/* __________________ DB*/
apiProductos.guardar({
  name: "celular",
  price: 120,
  thumbnail: "celular.jpg",
});
let DB_PRODUCTOS;
DB_PRODUCTOS = apiProductos.almacenar(apiProductos.generarDatos(5));

// mensajes
let DB_MENSAJES;
async function getMensajes() {
  try {
    DB_MENSAJES = await apiMensajes.listarAll();
  } catch (error) {
    console.log(`error al buscar mensajes ${error}`);
  }
}
getMensajes();

/* __________________ RUTAS */
app.get("/", (req, res) => {
  res.redirect("/login");
});
app.get("/api/productos-test", isAuth, (req, res) => {
  res.render("formulario", { DB_PRODUCTOS });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/api/productos-test",
    failureRedirect: "/login-error",
  })
);
app.get("/login-error", (req, res) => {
  res.render("login-error");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { nombre, password, direccion } = req.body;

  const newUsuario = usuariosApi.findOneByName(nombre);
  // const newUsuario = usuariosApi.getAll().find((usuario) => usuario.nombre == nombre);
  if (newUsuario) {
    res.render("register-error");
  } else {
    const newUser = {
      nombre,
      password: await generateHashPassword(password),
      direccion,
    };
    console.log(newUser);
    usuariosApi.save(newUser);
    res.redirect("/login");
  }
});
app.get("/info", (req, res) => {
  res.render("info", {
    argsSliced,
    pathArg,
    so,
    processID,
    version,
    pathProject,
    memoriaRSS,
  });
});

/* __________________ SERVIDOR */
/* __________________ CLUSTER */
const CPU_CORES = os.cpus().length;
const serverMode = parseInt(process.argv[3] || "FORK")
if (cluster.isPrimary && serverMode == "CLUSTER") {
  console.log("Cant de cores: ", CPU_CORES);

  for (let i = 0; i < CPU_CORES; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(
      `Worker ${process.pid} ${worker.id} ${
        worker.pid
      } finalizo ${new Date().toLocaleString()}`
    );
    cluster.fork();
  });
} else {
  const PORT = parseInt(process.argv[2]) || 8080;
  const server = httpServer.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
  server.on("error", (err) => {
    console.log(`error en el server: ${err}`);
  });
}


/* __________________ WEB-SOCKET */
io.on("connection", (socket) => {
  console.log(`Nuevo cliente conectado ${socket.id}`);
  socket.emit("from-server-productos", DB_PRODUCTOS);
  socket.emit("from-server-mensajes", DB_MENSAJES);

  socket.on("from-client-producto", (producto) => {
    (async () => {
      try {
        await apiProductos.guardar(producto);
        DB_PRODUCTOS = await apiProductos.listarAll();
        io.sockets.emit("from-server-productos", DB_PRODUCTOS);
      } catch (error) {
        console.log(`error al insertar producto desde socket io: ${error}`);
      }
    })();
  });

  socket.on("from-client-mensaje", (mensaje) => {
    (async () => {
      try {
        let db = DB_MENSAJES;
        let newTimestamp = new Date().toLocaleString();
        let newMsg = { ...mensaje, timestamp: newTimestamp };
        db.push(newMsg);
        apiMensajes.guardar(db).then(() => {
          console.log(db);
          io.sockets.emit("from-server-mensajes", db);
        });
      } catch (error) {
        console.log(`error al escribir mensaje ${error}`);
      }
    })();
  });
});
