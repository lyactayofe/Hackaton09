const { Router } = require("express");
const { Enrollment, Course, User, sequelize } = require("../models");
const { appError } = require("../middlewares/errorHandler");

const router = Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  const { courseId } = req.params;
  const { userId } = req.body;
  if (!userId) return next(appError(400, "MISSING_FIELD", "userId es requerido"));
  const t = await sequelize.transaction();
  try {
    const course = await Course.findByPk(courseId, { transaction: t });
    if (!course) { await t.rollback(); return next(appError(404, "NOT_FOUND", "Curso no encontrado")); }
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) { await t.rollback(); return next(appError(404, "NOT_FOUND", "Usuario no encontrado")); }
    const existing = await Enrollment.findOne({ where: { userId, courseId }, transaction: t });
    if (existing) { await t.rollback(); return next(appError(409, "ALREADY_ENROLLED", "El usuario ya está inscrito")); }
    const enrollment = await Enrollment.create({ userId, courseId, status: "pending" }, { transaction: t });
    await enrollment.update({ status: "active" }, { transaction: t });
    await Course.increment("studentsCount", { by: 1, where: { id: courseId }, transaction: t });
    await t.commit();
    return res.status(201).json({ status: "ok", data: enrollment });
  } catch (error) { await t.rollback(); next(error); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return next(appError(404, "NOT_FOUND", "Enrollment no encontrado"));
    const { status, score } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (score !== undefined) updates.score = score;
    await enrollment.update(updates);
    return res.json({ status: "ok", data: enrollment });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;
    const where = { courseId };
    if (status) where.status = status;
    const enrollments = await Enrollment.findAll({
      where,
      include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] }],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ status: "ok", total: enrollments.length, data: enrollments });
  } catch (error) { next(error); }
});

module.exports = router;