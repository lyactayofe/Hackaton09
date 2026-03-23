require("dotenv").config();
const express = require("express");
const sequelize = require("./db");

const usersRouter       = require("./routes/users.routes");
const coursesRouter     = require("./routes/courses.routes");
const lessonsRouter     = require("./routes/lessons.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const commentsRouter    = require("./routes/comments.routes");

const { errorHandler } = require("./middlewares/errorHandler");
require("./models");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));

app.use("/api/users",   usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/courses/:courseId/lessons",      lessonsRouter);
app.use("/api/lessons",                        lessonsRouter);
app.use("/api/courses/:courseId/enroll",       enrollmentsRouter);
app.use("/api/courses/:courseId/enrollments",  enrollmentsRouter);
app.use("/api/enrollments",                    enrollmentsRouter);
app.use("/api/lessons/:lessonId/comments",     commentsRouter);

app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión con la BD exitosa.");
    const syncMode = process.env.DB_SYNC || "alter";
    if (syncMode === "force") await sequelize.sync({ force: true });
    else if (syncMode === "alter") await sequelize.sync({ alter: true });
    else await sequelize.sync();
    console.log(`⚠️  DB_SYNC: ${syncMode.toUpperCase()}`);
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Fallo al iniciar:", err.message);
    process.exit(1);
  }
}

start();