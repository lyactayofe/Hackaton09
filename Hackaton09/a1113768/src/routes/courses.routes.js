const { Router } = require("express");
const { Op } = require("sequelize");

const { Course, User } = require("../models");
const { appError } = require("../middlewares/errorHandler");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { title, description, published, ownerId, slug } = req.body;

    const owner = await User.findByPk(ownerId);
    if (!owner)
      return next(appError(404, "NOT_FOUND", "Owner user not found."));

    if (!["instructor", "admin"].includes(owner.role)) {
      return next(
        appError(
          403,
          "FORBIDDEN",
          "Only instructors or admins can create courses.",
        ),
      );
    }

    const course = await Course.create({
      title,
      description,
      published,
      ownerId,
      slug,
    });

    return res.status(201).json({ status: "ok", data: course });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
