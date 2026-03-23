const sequelize = require("../db");
const { Model, DataTypes } = require("sequelize");

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El comentario no puede estar vacío" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
  }
);

// Hook: trim body y rechaza si queda vacío o muy corto
Comment.beforeCreate((comment) => {
  if (comment.body) comment.body = comment.body.trim();
  if (!comment.body || comment.body.length < 3) {
    const err = new Error("El comentario debe tener al menos 3 caracteres");
    err.statusCode = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
});

module.exports = Comment;
