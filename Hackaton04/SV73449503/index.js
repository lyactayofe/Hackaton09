//1
function suma(a, b) {
  return a + b;
}
//2
function potencia(base, exponente) {
  return base ** exponente;
}
//3
function sumOfCubes(...nums) {
  return nums.reduce((acc, n) => acc + n ** 3, 0);
}

//4
function triArea(base, altura) {
  return (base * altura) / 2;
}

//5
function calculator(num1, op, num2) {
  switch (op) {
    case "+":
      return num1 + num2;
    case "-":
      return num1 - num2;
    case "/":
      return num2 === 0 ? "No se puede dividir por cero" : num1 / num2;
    case "x":
    case "*":
      return num1 * num2;
    case "%":
      return num1 % num2;
    default:
      return "El parámetro no es reconocido";
  }
}

//6
function tipoDeValor(valor) {
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "array";
  return typeof valor;
}

//7
function sumarTodos(...args) {
  return args.reduce((acc, n) => acc + n, 0);
}

//8
function filtrarNoStrings(arr) {
  return arr.filter((v) => typeof v !== "string");
}

//9
function minMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}

//10
function formatPhoneNumber(arr) {
  return `(${arr.slice(0, 3).join("")}) ${arr.slice(3, 6).join("")}-${arr.slice(6).join("")}`;
}

//11
function findLargestNums(matriz) {
  return matriz.map((sub) => Math.max(...sub));
}

//12
function charIndex(palabra, char) {
  const first = palabra.indexOf(char);
  const last = palabra.lastIndexOf(char);
  return first === -1 ? [-1, -1] : [first, last];
}

//13
function toArray(obj) {
  return Object.entries(obj);
}

//14
function getBudgets(personas) {
  return personas.reduce((acc, p) => acc + p.budget, 0);
}

//15
function getStudentNames(alumnos) {
  return alumnos.map((a) => a.name);
}

//16
function squaresSum(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i ** 2;
  return total;
}

//17
function multiplyByLength(arr) {
  return arr.map((n) => n * arr.length);
}

//18
function countdown(n) {
  const out = [];
  for (let i = n; i >= 0; i--) out.push(i);
  return out;
}

//19
function diffMaxMin(arr) {
  return Math.max(...arr) - Math.min(...arr);
}

//20
function filterList(arr) {
  return arr.filter((v) => Number.isInteger(v));
}

//21
function repeat(elemento, veces) {
  return Array(veces).fill(elemento);
}

String.prototype.vreplace = function (vocal) {
  return this.replace(/[aeiou]/gi, vocal);
};

//22
function findNemo(texto) {
  const words = texto.split(" ");
  const idx = words.indexOf("Nemo");
  return idx === -1 ? "No encontré a Nemo" : `I found Nemo at ${idx + 1}!`;
}

//23
function capLast(texto) {
  return texto
    .split(" ")
    .map((p) => (p ? p.slice(0, -1) + p.slice(-1).toUpperCase() : p))
    .join(" ");
}

//25
function quizFuncionYArgumentos(definicion, limiteArgumentos) {
  const opcionesDefinicion = [
    "Las funciones son objetos de primera clase, es decir, se pueden manipular y transmitir como cualquier otro objeto.",
    "Una función solo sirve para imprimir texto.",
    "Una función no se puede pasar como argumento."
  ];
  const opcionesArgumentos = ["Solo 2", "Hasta 255 argumentos", "Solo 10"];

  const definicionCorrecta =
    "Las funciones son objetos de primera clase, es decir, se pueden manipular y transmitir como cualquier otro objeto.";
  const limiteCorrecto = "Hasta 255 argumentos";

  const definicionValida = definicion === definicionCorrecta;
  const argumentosValidos = limiteArgumentos === limiteCorrecto;

  return {
    preguntas: [
      {
        pregunta: "¿Cómo defines una función?",
        opciones: opcionesDefinicion
      },
      {
        pregunta: "¿Hasta cuántos argumentos puedes declarar en una función?",
        opciones: opcionesArgumentos
      }
    ],
    respuestasUsuario: {
      definicion,
      limiteArgumentos
    },
    resultado: definicionValida && argumentosValidos ? "Correcto" : "Incorrecto"
  };
}


function showOutput() {
  const output = document.getElementById("output");
  const quiz = document.getElementById("quiz25");
  if (output) output.style.display = "block";
  if (quiz) quiz.style.display = "none";
}

function showQuiz25() {
  const output = document.getElementById("output");
  const quiz = document.getElementById("quiz25");
  if (output) output.style.display = "none";
  if (quiz) quiz.style.display = "block";
}

function printResult(title, input, output) {
  showOutput();
  const el = document.getElementById("output");
  el.textContent = `${title}\nEntrada: ${input}\nSalida: ${JSON.stringify(output, null, 2)}`;
}

function openQuiz25() {
  showQuiz25();
  const result = document.getElementById("quiz25-result");
  const definicion = document.getElementById("q25-definicion");
  const args = document.getElementById("q25-args");
  if (definicion) definicion.value = "";
  if (args) args.value = "";
  if (result) result.textContent = "Selecciona tus respuestas y presiona Validar.";
}

function validarQuiz25() {
  const definicion = document.getElementById("q25-definicion")?.value || "";
  const limiteArgumentos = document.getElementById("q25-args")?.value || "";
  const result = document.getElementById("quiz25-result");

  if (!definicion || !limiteArgumentos) {
    if (result) result.textContent = "Debes elegir una opción en ambas preguntas.";
    return;
  }

  const evaluacion = quizFuncionYArgumentos(definicion, limiteArgumentos);

  if (result) {
    result.textContent =
      evaluacion.resultado === "Correcto"
        ? "Correcto: elegiste las dos respuestas correctas."
        : "Incorrecto: vuelve a intentarlo.";
  }
}

function askText(message) {
  const value = prompt(message);
  if (value === null) return null;
  return value.trim();
}

function askNumber(message) {
  const raw = askText(message);
  if (raw === null) return null;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

function askCsvNumbers(message) {
  const raw = askText(message);
  if (raw === null) return null;
  const arr = raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v));
  return arr.length ? arr : null;
}

function askJson(message) {
  const raw = askText(message);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function runExercise(id) {
  switch (id) {
    case 1: {
      const a = askNumber("Ejercicio 1\nIngresa el primer número:");
      const b = askNumber("Ejercicio 1\nIngresa el segundo número:");
      if (a === null || b === null) return alert("Entrada inválida.");
      printResult("01) suma(a, b)", `suma(${a}, ${b})`, suma(a, b));
      break;
    }
    case 2: {
      const base = askNumber("Ejercicio 2\nIngresa la base:");
      const exp = askNumber("Ejercicio 2\nIngresa el exponente:");
      if (base === null || exp === null) return alert("Entrada inválida.");
      printResult("02) potencia(base, exponente)", `potencia(${base}, ${exp})`, potencia(base, exp));
      break;
    }
    case 3: {
      const nums = askCsvNumbers("Ejercicio 3\nIngresa números separados por coma (ej: 1,5,9):");
      if (!nums) return alert("Entrada inválida.");
      printResult("03) sumOfCubes(...nums)", `sumOfCubes(${nums.join(", ")})`, sumOfCubes(...nums));
      break;
    }
    case 4: {
      const base = askNumber("Ejercicio 4\nIngresa la base del triángulo:");
      const altura = askNumber("Ejercicio 4\nIngresa la altura del triángulo:");
      if (base === null || altura === null) return alert("Entrada inválida.");
      printResult("04) triArea(base, altura)", `triArea(${base}, ${altura})`, triArea(base, altura));
      break;
    }
    case 5: {
      const n1 = askNumber("Ejercicio 5\nIngresa el primer número:");
      const op = askText("Ejercicio 5\nIngresa operación (+, -, /, x, %):");
      const n2 = askNumber("Ejercicio 5\nIngresa el segundo número:");
      if (n1 === null || n2 === null || !op) return alert("Entrada inválida.");
      printResult("05) calculator(num1, op, num2)", `calculator(${n1}, "${op}", ${n2})`, calculator(n1, op, n2));
      break;
    }
    case 6: {
      const raw = askText("Ejercicio 6\nIngresa cualquier valor (ej: 123, hola, true, [1,2], {\"a\":1}, null):");
      if (raw === null) return;
      let val = raw;
      try {
        val = JSON.parse(raw);
      } catch {
        // Si no es JSON válido, se mantiene string plano
      }
      printResult("06) tipoDeValor(valor)", raw, tipoDeValor(val));
      break;
    }
    case 7: {
      const nums = askCsvNumbers("Ejercicio 7\nIngresa números separados por coma:");
      if (!nums) return alert("Entrada inválida.");
      printResult("07) sumarTodos(...args)", `sumarTodos(${nums.join(", ")})`, sumarTodos(...nums));
      break;
    }
    case 8: {
      const arr = askJson('Ejercicio 8\nIngresa un array en formato JSON (ej: [1,"a",true,"x",10]):');
      if (!Array.isArray(arr)) return alert("Entrada inválida.");
      printResult("08) filtrarNoStrings(arr)", JSON.stringify(arr), filtrarNoStrings(arr));
      break;
    }
    case 9: {
      const nums = askCsvNumbers("Ejercicio 9\nIngresa números separados por coma:");
      if (!nums) return alert("Entrada inválida.");
      printResult("09) minMax(arr)", JSON.stringify(nums), minMax(nums));
      break;
    }
    case 10: {
      const nums = askCsvNumbers("Ejercicio 10\nIngresa 10 dígitos separados por coma:");
      if (!nums || nums.length !== 10) return alert("Debes ingresar exactamente 10 números.");
      printResult("10) formatPhoneNumber(arr)", JSON.stringify(nums), formatPhoneNumber(nums));
      break;
    }
    case 11: {
      const matriz = askJson("Ejercicio 11\nIngresa una matriz JSON (ej: [[4,2,7,1],[20,70,40,90],[1,2,0]]):");
      if (!Array.isArray(matriz)) return alert("Entrada inválida.");
      printResult("11) findLargestNums(matriz)", JSON.stringify(matriz), findLargestNums(matriz));
      break;
    }
    case 12: {
      const palabra = askText("Ejercicio 12\nIngresa una palabra:");
      const char = askText("Ejercicio 12\nIngresa un carácter:");
      if (!palabra || !char) return alert("Entrada inválida.");
      printResult("12) charIndex(palabra, char)", `charIndex("${palabra}", "${char}")`, charIndex(palabra, char));
      break;
    }
    case 13: {
      const obj = askJson('Ejercicio 13\nIngresa un objeto JSON (ej: {"a":1,"b":2}):');
      if (!obj || Array.isArray(obj) || typeof obj !== "object") return alert("Entrada inválida.");
      printResult("13) toArray(obj)", JSON.stringify(obj), toArray(obj));
      break;
    }
    case 14: {
      const personas = askJson(
        'Ejercicio 14\nIngresa array de personas JSON (ej: [{"name":"John","budget":23000},{"name":"Steve","budget":40000}]):'
      );
      if (!Array.isArray(personas)) return alert("Entrada inválida.");
      printResult("14) getBudgets(personas)", JSON.stringify(personas), getBudgets(personas));
      break;
    }
    case 15: {
      const alumnos = askJson('Ejercicio 15\nIngresa array JSON (ej: [{"name":"Steve"},{"name":"Mike"}]):');
      if (!Array.isArray(alumnos)) return alert("Entrada inválida.");
      printResult("15) getStudentNames(alumnos)", JSON.stringify(alumnos), getStudentNames(alumnos));
      break;
    }
    case 16: {
      const n = askNumber("Ejercicio 16\nIngresa n:");
      if (n === null) return alert("Entrada inválida.");
      printResult("16) squaresSum(n)", `squaresSum(${n})`, squaresSum(n));
      break;
    }
    case 17: {
      const nums = askCsvNumbers("Ejercicio 17\nIngresa números separados por coma:");
      if (!nums) return alert("Entrada inválida.");
      printResult("17) multiplyByLength(arr)", JSON.stringify(nums), multiplyByLength(nums));
      break;
    }
    case 18: {
      const n = askNumber("Ejercicio 18\nIngresa número inicial del countdown:");
      if (n === null) return alert("Entrada inválida.");
      printResult("18) countdown(n)", `countdown(${n})`, countdown(n));
      break;
    }
    case 19: {
      const nums = askCsvNumbers("Ejercicio 19\nIngresa números separados por coma:");
      if (!nums) return alert("Entrada inválida.");
      printResult("19) diffMaxMin(arr)", JSON.stringify(nums), diffMaxMin(nums));
      break;
    }
    case 20: {
      const arr = askJson('Ejercicio 20\nIngresa un array JSON (ej: [1,2,3,"x","y",10]):');
      if (!Array.isArray(arr)) return alert("Entrada inválida.");
      printResult("20) filterList(arr)", JSON.stringify(arr), filterList(arr));
      break;
    }
    case 21: {
      const elementoRaw = askText("Ejercicio 21\nIngresa el elemento a repetir:");
      const veces = askNumber("Ejercicio 21\nIngresa cuántas veces repetir:");
      if (elementoRaw === null || veces === null) return alert("Entrada inválida.");
      let elemento = elementoRaw;
      try {
        elemento = JSON.parse(elementoRaw);
      } catch {
        // string plano
      }
      printResult("21) repeat(elemento, veces)", `repeat(${JSON.stringify(elemento)}, ${veces})`, repeat(elemento, veces));
      break;
    }
    case 22: {
      const texto = askText("Ejercicio 22\nIngresa un texto:");
      const vocal = askText("Ejercicio 22\nIngresa la vocal de reemplazo:");
      if (!texto || !vocal) return alert("Entrada inválida.");
      printResult("22) texto.vreplace(vocal)", `"${texto}".vreplace("${vocal}")`, texto.vreplace(vocal));
      break;
    }
    case 23: {
      const texto = askText("Ejercicio 23\nIngresa una frase que contenga 'Nemo':");
      if (!texto) return alert("Entrada inválida.");
      printResult("23) findNemo(texto)", `findNemo("${texto}")`, findNemo(texto));
      break;
    }
    case 24: {
      const texto = askText("Ejercicio 24\nIngresa una palabra o frase:");
      if (!texto) return alert("Entrada inválida.");
      printResult("24) capLast(texto)", `capLast("${texto}")`, capLast(texto));
      break;
    }
    case 25:
      openQuiz25();
      break;
    default:
      printResult("Ejercicio", "N/A", "No existe ese ejercicio");
  }
}
  

