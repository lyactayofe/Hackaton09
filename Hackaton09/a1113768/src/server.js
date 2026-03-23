require("dotenv").config();
const express = require("express");
const sequelize = require("./db");

const usersRouter = require("./routes/users.routes");
const coursesRouter = require("./routes/courses.routes");

const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ROUTES
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);

// MANEJO GLOBAL DE ERRORES
app.use(errorHandler);

async function start(params) {
  try {
    await sequelize.authenticate();
    console.log("Conexion con la bd exitosa.");

    const syncMode = process.env.DB_SYNC || "alter";

    if (syncMode === "force") {
      await sequelize.sync({ force: true });
      console.warn("DB_SYNC FORCE");
    } else if (syncMode === "alter") {
      await sequelize.sync({ force: true });
      console.warn("DB_SYNC ALTER");
    } else {
      await sequelize.sync({ force: false });
      console.warn("DB_SYNC NONE");
    }

    app.listen(PORT, () => {
      console.log(`El servidor esta corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Fallo al iniciar el servidor: ", err);
    process.exit(1);
  }
}

start();
