// script.js - soporte correcto de %
const pantalla = document.querySelector(".pantalla");
const botones = document.querySelectorAll(".btn");

botones.forEach(boton => {
  boton.addEventListener("click", () => {
    const v = boton.textContent.trim();

    // C
    if (v === "C") {
      pantalla.textContent = "0";
      return;
    }

    // Del
    if (v === "Del") {
      pantalla.textContent = pantalla.textContent.slice(0, -1) || "0";
      return;
    }

    // =
    if (v === "=") {
      try {
        let raw = pantalla.textContent.replace(/x/g, "*").replace(/×/g, "*").replace(/÷/g, "/");

        // Tokenizar: números (posible %) y operadores/paréntesis
        const tokens = raw.match(/(\d+(\.\d+)?%?)|[+\-*/()]/g);
        if (!tokens) {
          pantalla.textContent = "Error";
          return;
        }

        // Procesar porcentajes: cada token que tenga '%' se transforma según el operador anterior
        for (let i = 0; i < tokens.length; i++) {
          if (typeof tokens[i] === "string" && tokens[i].endsWith("%")) {
            const pct = parseFloat(tokens[i].slice(0, -1)) / 100; // 10% -> 0.1

            const prevOp = tokens[i - 1]; // normalmente es el operador antes del %
            // operador anterior a la posición del porcentaje suele estar en i-1 (si existe)
            // el número base (para +/−) está en i-2
            if (prevOp === "+" || prevOp === "-") {
              const baseIndex = i - 2;
              if (baseIndex >= 0 && /^[0-9]/.test(tokens[baseIndex])) {
                const base = parseFloat(tokens[baseIndex]);
                tokens[i] = (base * pct).toString(); // convierte 10% a (base * 0.1)
              } else {
                // fallback: trata como valor absoluto (0.1)
                tokens[i] = pct.toString();
              }
            } else {
              // si el operador anterior es * o /, o no existe → usar directamente la fracción
              tokens[i] = pct.toString();
            }
          }
        }

        // Reconstruir expresión segura (sin % ya)
        const expr = tokens.join(" ");

        // Eval (simple). Para seguridad mínima aceptamos sólo dígitos, operadores y espacios
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
          pantalla.textContent = "Error";
          return;
        }

        let resultado = eval(expr);

        // Formateo: evitar notación extra larga
        if (typeof resultado === "number" && !Number.isInteger(resultado)) {
          resultado = parseFloat(resultado.toFixed(12));
        }

        pantalla.textContent = String(resultado);
      } catch (err) {
        console.error(err);
        pantalla.textContent = "Error";
      }
      return;
    }

    // Si pantalla es "0" y se presiona número o punto -> reemplazar
    if (pantalla.textContent === "0") {
      // Evita empezar con operador como * o /
      if (v === "x" || v === "×" || v === "*" || v === "/") return;
      pantalla.textContent = v;
      return;
    }

    // Concatenar (normal)
    pantalla.textContent += v;
  });
});
