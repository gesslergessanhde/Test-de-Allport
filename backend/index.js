const express = require('express');
const cors = require('cors');

// Importación de datos modulares aislados
const db_usuarios = require('./data/usuarios');
const { db_preguntas_p1, db_preguntas_p2 } = require('./data/preguntas');

// Importación del servicio desacoplado de correo real
const { enviarReporteAxiologico } = require('./services/emailService');

const app = express();
app.use(cors());
app.use(express.json());

// Arreglos dinámicos para almacenar el estado en memoria
let db_respuestas_progreso = [];
let db_resultados = [
    { 
        id_resultado: 3, 
        nombre: "Aspirante de Admisión", 
        cif: "2026-0001U", 
        email: "", 
        total_teorico: 40, total_economico: 40, total_estetico: 40, total_social: 40, total_politico: 40, total_religioso: 40, 
        estado_evaluacion: "Pendiente",
        notas_entrevista: "",
        respuestas_guardadas: null
    }
];

// ================= ALGORITMO REAL DE CALIFICACIÓN DE ALLPORT =================
// ================= ALGORITMO CORREGIDO DE CALIFICACIÓN DE ALLPORT =================
function calcularResultadosAllport(respuestasP1, respuestasP2) {
    // Aseguramos que los objetos existan para evitar errores de lectura
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

    // Mapeo de la Parte 1 (Búsqueda por llave de texto convertida)
    for (let i = 1; i <= 30; i++) {
        const llave = String(i); // Convertimos el índice a String para hacer match con el JSON
        const r = rP1[llave] || { a: 0, b: 0 };
        
        if (i >= 1 && i <= 8)   { P2.R += r.a; P2.S += r.b; } 
        if (i >= 9 && i <= 16)  { P3.R += r.a; P3.S += r.b; }
        if (i >= 17 && i <= 23) { P4.R += r.a; P4.S += r.b; }
        if (i >= 24 && i <= 30) { P5.R += r.a; P5.S += r.b; }
    }

    // Mapeo de la Parte 2 (Búsqueda por llave de texto convertida)
    for (let i = 1; i <= 15; i++) {
        const llave = String(i); // Convertimos el índice a String
        const r = rP2[llave] || { 0:0, 1:0, 2:0, 3:0 };
        
        if (i >= 1 && i <= 6)   { P7.R += (r[0]||0); P7.S += (r[1]||0); }
        if (i >= 7 && i <= 11)  { P8.R += (r[0]||0); P8.S += (r[1]||0); }
        if (i >= 12 && i <= 15) { P9.R += (r[0]||0); P9.S += (r[1]||0); }
    }

    // Matriz de calificación matemática oficial del PDF (Cuadro 1)
    let teorica   = P2.R + P3.Z + P4.X + P5.S + P7.Y + P8.T + P9.R + 3;  // +3 Cifra Corrección
    let economico = P2.S + P3.Y + P4.R + P5.X + P7.T + P8.Z + P9.S - 1;  // -1 Cifra Corrección
    let estetico  = P2.T + P3.X + P4.Z + P5.Y + 5    + P8.R + P9.T + 4;  // +4 Cifra Corrección (P7 fijo en 5)
    let social    = P2.X + P3.T + P4.S + P5.R + P7.Z + P8.Y + P9.X - 3;  // -3 Cifra Corrección
    let politico  = P2.Y + P3.S + P4.T + P5.Z + P7.R + P8.X + P9.Y + 2;  // +2 Cifra Corrección
    let religioso = P2.Z + P3.R + P4.Y + P5.T + P7.X + P8.S + P9.Z - 5;  // -5 Cifra Corrección

    return { teorica, economico, estetico, social, politico, religioso };
}

// ================= ENDPOINTS CONTROLADORES =================

app.post('/api/login', (req, res) => {
    const { cif, password } = req.body;
    const usuario = db_usuarios.find(u => u.cif === cif && u.password_hash === password);
    if (usuario) res.json({ success: true, user: usuario });
    else res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
});

app.get('/api/preguntas/p1', (req, res) => res.json(db_preguntas_p1));
app.get('/api/preguntas/p2', (req, res) => res.json(db_preguntas_p2));
app.get('/api/resultados', (req, res) => res.json(db_resultados));

// Sincronización Upsert Avanzada basada en Baremos del PDF
app.post('/api/respuestas', (req, res) => {
    const { id_aspirante, respuestasP1, respuestasP2 } = req.body;
    
    const usuario = db_usuarios.find(u => u.id_aspirante === id_aspirante);
    const scores = calcularResultadosAllport(respuestasP1, respuestasP2);

    const index = db_resultados.findIndex(r => r.id_resultado === id_aspirante);
    const item = {
        id_resultado: id_aspirante,
        nombre: usuario ? usuario.nombre_aspirante : "Aspirante",
        cif: usuario ? usuario.cif : "N/A",
        email: "tu_correo_real_aqui@gmail.com", // Sincroniza dinámicamente con tu bandeja para la prueba
        total_teorico: scores.teorica,
        total_economico: scores.economico,
        total_estetico: scores.estetico,
        total_social: scores.social,
        total_politico: scores.politico,
        total_religioso: scores.religioso,
        estado_evaluacion: "Completado",
        notas_entrevista: "",
        respuestas_guardadas: { respuestasP1, respuestasP2 }
    };

    if (index !== -1) db_resultados[index] = item;
    else db_resultados.push(item);

    res.json({ success: true, message: "Respuestas evaluadas y guardadas con éxito." });
});

app.post('/api/entrevista/:id', (req, res) => {
    const { notas } = req.body;
    const item = db_resultados.find(r => r.id_resultado == req.params.id);
    if (item) {
        item.notas_entrevista = notas;
        item.estado_evaluacion = "Entrevistado";
    }
    res.json({ success: true });
});

// Reemplaza tu endpoint app.post('/api/enviar-correo/:id', ...) por este definitivo:
app.post('/api/enviar-correo/:id', async (req, res) => {
    const { emailPersonalizado } = req.body; // Recibe el correo elegido en pantalla
    const item = db_resultados.find(r => r.id_resultado == req.params.id);
    
    if (!item) {
        return res.status(404).json({ success: false, message: "Aspirante no encontrado." });
    }

    try {
        // Ejecuta el servicio pasando las notas guardadas y la dirección elegida
        await enviarReporteAxiologico(item, emailPersonalizado);

        item.estado_evaluacion = "Resultados Enviados";
        res.json({ success: true, message: `Expediente transmitido con éxito vía Gmail a: ${emailPersonalizado}` });
    } catch (error) {
        console.error("Error en la pasarela SMTP de Gmail:", error);
        res.status(500).json({ success: false, message: "Falla al autenticar o despachar el correo con Google." });
    }
});

app.listen(3001, () => console.log('Server Axiológico Modular Allport activo en puerto 3001'));