const sequelize = require("./db");
const { User, Course } = require("./models");

require("dotenv").config();

async function seed() {
  try {
    await sequelize.authenticate();

    console.log("Conexion con la bd exitosa");

    await sequelize.sync({ alter: true });

    await User.bulkCreate(
      [
        {
          firstName: "Admin",
          lastName: "Root",
          email: "admin@platform.io",
          passwordHash: "hashed_admin_password",
          role: "admin",
        },
        {
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@platform.io",
          passwordHash: "hashed_ada_password",
          role: "instructor",
        },
        {
          firstName: "Linus",
          lastName: "Torvalds",
          email: "linus@platform.io",
          passwordHash: "hashed_linus_password",
          role: "instructor",
        },
        {
          firstName: "Grace",
          lastName: "Hopper",
          email: "grace@platform.io",
          passwordHash: "hashed_grace_password",
          role: "student",
        },
        {
          firstName: "Alan",
          lastName: "Turing",
          email: "alan@platform.io",
          passwordHash: "hashed_alan_password",
          role: "student",
        },
        {
          firstName: "Margaret",
          lastName: "Hamilton",
          email: "margaret@platform.io",
          passwordHash: "hashed_margaret_password",
          role: "student",
        },
      ],
      { ignoreDuplicates: true },
    );

    const ada = await User.findOne({ where: { email: "ada@platform.io" } });

    console.log(`${await User.count()} users created.`);

    console.log('Ada ID', ada)

    console.log('\n📦  Seeding Courses...');
    const [courseNode] = await Course.findOrCreate({
      where: { slug: 'intro-a-nodejs' },
      defaults: {
        title:       'Intro a Node.js',
        description: 'Curso base de Node.js: módulos, eventos, streams y HTTP nativo.',
        published:   true,
        ownerId:     ada.id,
      },
    });

    const [courseLinux] = await Course.findOrCreate({
      where: { slug: 'linux-para-desarrolladores' },
      defaults: {
        title:       'Linux para Desarrolladores',
        description: 'Domina la línea de comandos, scripting bash y administración básica de servidores.',
        published:   true,
        ownerId:     ada.id,
      },
    });

    const [courseDraft] = await Course.findOrCreate({
      where: { slug: 'arquitectura-de-software-avanzada' },
      defaults: {
        title:       'Arquitectura de Software Avanzada',
        description: 'Patrones, principios SOLID, DDD y arquitectura hexagonal.',
        published:   false,
        ownerId:     ada.id,
      },
    });

    console.log(`${await Course.count()} cursos creados`);

    process.exit(0);
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
}

seed();
