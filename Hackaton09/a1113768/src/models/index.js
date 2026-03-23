const sequelize = require("../db");
const { Model } = require("sequelize");

const User = require("./User");
const Course = require("./Course");
const Lesson = require("./Lesson");
const Enrollment = require("./Enrollment");
const Comment = require("./Comment");

[User, Course, Lesson, Enrollment, Comment].forEach((M) => {
  if (!M || !(M.prototype instanceof Model))
    throw new Error(`Model ${M?.name ?? M} is not a valid Sequelize Model subclass.`);
});

// User 1:N Course
User.hasMany(Course, { foreignKey: "ownerId", as: "ownedCourses" });
Course.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Course 1:N Lesson
Course.hasMany(Lesson, { foreignKey: "courseId", as: "lessons" });
Lesson.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User N:M Course via Enrollment
User.belongsToMany(Course, { through: Enrollment, foreignKey: "userId", otherKey: "courseId", as: "enrolledCourses" });
Course.belongsToMany(User, { through: Enrollment, foreignKey: "courseId", otherKey: "userId", as: "students" });
Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });
User.hasMany(Enrollment, { foreignKey: "userId", as: "enrollments" });
Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });

// Lesson 1:N Comment
Lesson.hasMany(Comment, { foreignKey: "lessonId", as: "comments" });
Comment.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

// User 1:N Comment
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });

module.exports = { sequelize, User, Course, Lesson, Enrollment, Comment };