const { Router } = require("express");
const { Op } = require("sequelize");
const { Course, User, Lesson, Enrollment } = require("../models");
const { appError } = require("../middlewares/errorHandler");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { title, description, published, ownerId, slug } = req.body;
    const owner = await User.findByPk(ownerId);
    if (!owner) return next(appError(404, "NOT_FOUND", "Owner no encontrado."));
    if (!["instructor", "admin"].includes(owner.role))
      return next(appError(403, "FORBIDDEN", "Solo instructores o admins pueden crear cursos."));
    const course = await Course.create({ title, description, published, ownerId, slug });
    return res.status(201).json({ status: "ok", data: course });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { published, q, order: rawOrder, createdAt_gte, createdAt_lte } = req.query;
    const { page, pageSize, limit, offset } = getPagination(req.query);
    const where = {};
    if (published !== undefined) where.published = published === "true";
    if (q && q.trim()) {
      const search = `%${q.trim()}%`;
      where[Op.or] = [{ title: { [Op.iLike]: search } }, { description: { [Op.iLike]: search } }];
    }
    if (createdAt_gte || createdAt_lte) {
      where.createdAt = {};
      if (createdAt_gte) where.createdAt[Op.gte] = new Date(createdAt_gte);
      if (createdAt_lte) where.createdAt[Op.lte] = new Date(createdAt_lte);
    }
    let orderClause = [["createdAt", "DESC"]];
    if (rawOrder) {
      const [field, dir] = rawOrder.split(":");
      if (["createdAt","title","studentsCount"].includes(field))
        orderClause = [[field, (dir || "ASC").toUpperCase()]];
    }
    const result = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: "owner", attributes: ["id", "firstName", "lastName"] }],
      order: orderClause, limit, offset,
    });
    return res.json(paginatedResponse(result, page, pageSize));
  } catch (error) { next(error); }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: User, as: "owner", attributes: ["id", "firstName", "lastName", "email"] },
        { model: Lesson, as: "lessons", attributes: ["id", "title", "slug", "order"] },
      ],
    });
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    const studentsCount = await Enrollment.count({ where: { courseId: course.id, status: "active" } });
    return res.json({ status: "ok", data: { ...course.toJSON(), stats: { lessonsCount: course.lessons.length, studentsCount } } });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    const { title, description, published, slug } = req.body;
    if (title && title !== course.title) course.slug = null;
    await course.update({ title, description, published, slug });
    return res.json({ status: "ok", data: course });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    await course.destroy();
    return res.json({ status: "ok", message: "Curso eliminado (soft delete)" });
  } catch (error) { next(error); }
});

router.post("/:id/restore", async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, { paranoid: false });
    if (!course) return next(appError(404, "NOT_FOUND", "Curso no encontrado"));
    await course.restore();
    return res.json({ status: "ok", data: course });
  } catch (error) { next(error); }
});

module.exports = router;