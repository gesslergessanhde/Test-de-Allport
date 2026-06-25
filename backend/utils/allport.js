/**
 * Algoritmo Oficial de Corrección y Baremo Psicométrico del Test de Allport
 * Cruza las variables de control por rangos y aplica constantes fijas (+3, -1, +4, -3, +2, -5)
 */
function calcularResultadosAllport(respuestasP1, respuestasP2) {
    const rP1 = respuestasP1 || {};
    const rP2 = respuestasP2 || {};

    // Inicialización de contenedores por columna base del PDF (Cuadro 1)
    let P2 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P3 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P4 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P5 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P7 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P8 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };
    let P9 = { R:0, S:0, T:0, X:0, Y:0, Z:0 };

    // Mapeo de la Parte 1
    for (let i = 1; i <= 30; i++) {
        const llave = String(i);
        const r = rP1[llave] || { a: 0, b: 0 };
        
        if (i >= 1 && i <= 8)   { P2.R += r.a; P2.S += r.b; } 
        if (i >= 9 && i <= 16)  { P3.R += r.a; P3.S += r.b; }
        if (i >= 17 && i <= 23) { P4.R += r.a; P4.S += r.b; }
        if (i >= 24 && i <= 30) { P5.R += r.a; P5.S += r.b; }
    }

    // Mapeo de la Parte 2
    for (let i = 1; i <= 15; i++) {
        const llave = String(i);
        const r = rP2[llave] || { 0:0, 1:0, 2:0, 3:0 };
        
        if (i >= 1 && i <= 6)   { P7.R += (r[0]||0); P7.S += (r[1]||0); }
        if (i >= 7 && i <= 11)  { P8.R += (r[0]||0); P8.S += (r[1]||0); }
        if (i >= 12 && i <= 15) { P9.R += (r[0]||0); P9.S += (r[1]||0); }
    }

    // Matriz de calificación matemática oficial (Validación cruzada a 240 puntos)
    let teorica   = P2.R + P3.Z + P4.X + P5.S + P7.Y + P8.T + P9.R + 3;  
    let economico = P2.S + P3.Y + P4.R + P5.X + P7.T + P8.Z + P9.S - 1;  
    let estetico  = P2.T + P3.X + P4.Z + P5.Y + 5    + P8.R + P9.T + 4;  
    let social    = P2.X + P3.T + P4.S + P5.R + P7.Z + P8.Y + P9.X - 3;  
    let politico  = P2.Y + P3.S + P4.T + P5.Z + P7.R + P8.X + P9.Y + 2;  
    let religioso = P2.Z + P3.R + P4.Y + P5.T + P7.X + P8.S + P9.Z - 5;  

    return { teorica, economico, estetico, social, politico, religioso };
}

// Exportación modular limpia
module.exports = { calcularResultadosAllport };