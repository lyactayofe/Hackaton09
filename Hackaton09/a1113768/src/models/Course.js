const sequelize = require("../db");
const { Model, DataTypes } = require("sequelize");

class Course extends Model {}

function toSlug(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "") // keep alphanumeric, space, dash
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-"); // collapse consecutive dashes
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: {
        name: "course_title_unique",
        msg: "El curso debe ser unico",
      },
      validate: {
        notEmpty: { msg: "El titulo no debe ser vacio" },
        len: {
          args: [5, 200],
          msg: "El titulo del curso debe estar entre 5 y 200",
        },
      },
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: {
        name: "courses_slug_unique",
        msg: "El curso debe tener una ficha unica",
      },
      validate: {
        notEmpty: { msg: "slug no debe ser vacio" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    studentsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Course",
    tableName: "courses",
    timestamps: true,
    paranoid: true,
    defaultScope: {},
    scopes: {
      published: {
        where: { published: true },
      },
      withOwner() {
        const { User } = require("./User");
        return {
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        };
      },
    },
  },
);

Course.beforeValidate((course) => {
  if (course.title) course.title = course.title.trim();
  if (!course.slug && course.title) {
    course.slug = toSlug(course.title);
  }
  if (course.description) course.description = course.description.trim();
});

module.exports = Course;