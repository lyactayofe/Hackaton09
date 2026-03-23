const { Router } = require("express");
const { Op } = require("sequelize");

const { User } = require("../models");
const { appError } = require("../middlewares/errorHandler");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const router = Router();

// get all
router.get("/all", async (req, res, next) => {
  try {
    const { role, q, order: rawOrder } = req.query;
    const { page, pageSize, limit, offset } = getPagination(req.query);

    const where = {};

    if (role) {
      const validRoles = ["admin", "instructor", "student"];
      if (!validRoles.includes(role)) {
        return next(appError(400, "INVALID_ROLE", "role no permitido"));
      }
      where.role = role;
    }

    if (q && q.trim()) {
      const search = `%${q.trim()}%`;
      where[Op.or] = [
        { firstName: { [Op.like]: search } },
        { lastName: { [Op.like]: search } },
        { email: { [Op.like]: search } },
      ];
    }

    let orderClause = [["createdAt", "DESC"]];
    if (rawOrder) {
      const [field, dir] = rawOrder.split(":");
      const allowedField = [
        "firstName",
        "lastName",
        "email",
        "createdAt",
        "role",
      ];
      const allowedDirs = ["ASC", "DESC"];

      if (
        allowedField.includes(field) &&
        allowedDirs.includes(dir || "ASC").toUpperCase()
      ) {
        console.log("orderClause1: ", orderClause);
        orderClause = [[field, (dir || "ASC").toUpperCase()]];
        console.log("orderClause2: ", orderClause);
      }

      const result = await User.findAndCountAll({ where, order: orderClause, limit, offset });

      return res.json(paginatedResponse(result, page, pageSize));
    }
  } catch (error) {
    return next(error);
  }
});

// get user by id
router.get("/", async (req, res, next) => {
  try {
    const { id } = req.query;

    const user = await User.findByPk(id);
    if (!user) return next(appError(404, "NOT_FOUND", "usuario no encontrado"));

    return res.json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  console.log("req.body: ", req.body);
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password,
      role: role,
    });

    const created = await User.findByPk(user.id);
    return res.status(201).json({ status: "ok", data: created });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
