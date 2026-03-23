const sequelize = require("../db");
const { Model, DataTypes } = require("sequelize");

class Lesson extends Model {}

function toSlug(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El título no debe ser vacío" },
        len: { args: [3, 200], msg: "El título debe tener entre 3 y 200 caracteres" },
      },
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El slug no debe ser vacío" },
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El body no debe ser vacío" },
        len: { args: [20, 99999], msg: "El body debe tener al menos 20 caracteres" },
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Lesson",
    tableName: "lessons",
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ["slug", "courseId"] }],
  }
);

Lesson.beforeValidate((lesson) => {
  if (lesson.title) lesson.title = lesson.title.trim();
  if (!lesson.slug && lesson.title) {
    lesson.slug = toSlug(lesson.title);
  }
  if (lesson.body) lesson.body = lesson.body.trim();
});

module.exports = Lesson;
