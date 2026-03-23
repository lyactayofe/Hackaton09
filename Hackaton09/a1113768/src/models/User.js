const sequelize = require('../db');
const { Model, DataTypes } = require("sequelize");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre no puede estar vacio." },
        len: {
          args: [2, 80],
          msg: "El nombre debe tener como min 2 caracteres y como max 80",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El apelllido no puede estar vacio." },
        len: {
          args: [2, 80],
          msg: "El apelllido debe tener como min 2 caracteres y como max 80",
        },
      },
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: {
        name: "users_email_unique",
        msg: "El correo ya existe.",
      },
      validate: {
        isEmail: { msg: "Debe ser un email valido xxxx@xxx.xxx" },
        notEmpty: { msg: "El email no puede estar vacio" },
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "instructor", "student"),
      allowNull: false,
      defaultValue: "student",
      validate: {
        isIn: {
          args: [["admin", "instructor", "student"]],
          msg: "Roles permitidos son admin - instructor - student",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ["passwordHash"],
      },
    },
    scopes: {
      withPassword: { attributes: {} },
      byrole(role) {
        return { where: { role } };
      },
    },
  },
);

User.beforeValidate((user) => {
  if (user.firstName) user.firstName = user.firstName.trim();
  if (user.lastname) user.lastname = user.lastname.trim();
  if (user.email) user.email = user.email.trim();
});

module.exports = User;