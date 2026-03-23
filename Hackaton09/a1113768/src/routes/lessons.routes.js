const { Router } = require("express");
const { Course, Lesson, Comment, User } = require("../models");
const { appError } = require("../middlewares/errorHandler");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const router = Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, body, slug } = req.body;
    const course = await Course.findByPk(courseId);
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    const lastLesson = await Lesson.findOne({ where: { courseId }, order: [["order", "DESC"]] });
    const order = lastLesson ? lastLesson.order + 1 : 1;
    const lesson = await Lesson.create({ title, body, slug, order, courseId });
    return res.status(201).json({ status: "ok", data: lesson });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const dir = (req.query.order || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const course = await Course.findByPk(courseId);
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    const lessons = await Lesson.findAll({
      where: { courseId },
      include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
      order: [["order", dir]],
    });
    return res.json({ status: "ok", total: lessons.length, data: lessons });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return next(appError(404, "NOT_FOUND", "Lección no encontrada"));
    const { title, body, order, slug } = req.body;
    if (title && title !== lesson.title) lesson.slug = null;
    await lesson.update({ title, body, order, slug });
    return res.json({ status: "ok", data: lesson });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return next(appError(404, "NOT_FOUND", "Lección no encontrada"));
    await lesson.destroy();
    return res.json({ status: "ok", message: "Lección eliminada (soft delete)" });
  } catch (error) { next(error); }
});

module.exports = router;