const { Router } = require("express");
const { Comment, Lesson, User } = require("../models");
const { appError } = require("../middlewares/errorHandler");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const router = Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { body, userId } = req.body;
    if (!userId) return next(appError(400, "MISSING_FIELD", "userId es requerido"));
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return next(appError(404, "NOT_FOUND", "Lección no encontrada"));
    const user = await User.findByPk(userId);
    if (!user) return next(appError(404, "NOT_FOUND", "Usuario no encontrado"));
    const comment = await Comment.create({ body, userId, lessonId });
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "author", attributes: ["id", "firstName", "lastName"] }],
    });
    return res.status(201).json({ status: "ok", data: full });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { page, pageSize, limit, offset } = getPagination(req.query);
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return next(appError(404, "NOT_FOUND", "Lección no encontrada"));
    const result = await Comment.findAndCountAll({
      where: { lessonId },
      include: [{ model: User, as: "author", attributes: ["id", "firstName", "lastName"] }],
      order: [["createdAt", "DESC"]],
      limit, offset,
    });
    return res.json(paginatedResponse(result, page, pageSize));
  } catch (error) { next(error); }
});

module.exports = router;