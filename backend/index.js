const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Importación de servicios desacoplados y lógicos
const { enviarReporteAxiologico } = require('./services/emailService');
const { calcularResultadosAllport } = require('./utils/allport');

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS ABSOLUTAS DE NUESTROS ARCHIVOS DE PERSISTENCIA JSON
const PATH_USUARIOS = path.join(__dirname, 'data', 'usuarios.json');
const PATH_PREGUNTAS = path.join(__dirname, 'data', 'preguntas.json');
const PATH_RESULTADOS = path.join(__dirname, 'data', 'resultados.json');

// Asegurar que la carpeta 'data' exista al arrancar el servidor
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Inicializar archivo de usuarios base si no existiera previamente
if (!fs.existsSync(PATH_USUARIOS)) {
    fs.writeFileSync(PATH_USUARIOS, JSON.stringify([
        { "id_aspirante": 1, "nombre_aspirante": "Admin General", "cif": "admin", "password_hash": "admin", "rol": "admin" },
        { "id_aspirante": 2, "nombre_aspirante": "Psicólogo Evaluador", "cif": "evaluador", "password_hash": "123", "rol": "evaluador" },
        { "id_aspirante": 3, "nombre_aspirante": "Aspirante de Admisión", "cif": "2026-0001U", "password_hash": "12345", "rol": "usuario" }
    ], null, 2));
}

// Inicializar archivos vacíos de forma segura si no existieran previamente
if (!fs.existsSync(PATH_RESULTADOS)) {
    fs.writeFileSync(PATH_RESULTADOS, JSON.stringify([
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
    ], null, 2));
}

// Helpers globales de Persistencia JSON
const guardarEnDisco = (ruta, datos) => fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf8');
const obtenerUsuarios = () => JSON.parse(fs.readFileSync(PATH_USUARIOS, 'utf8'));
const obtenerPreguntas = () => JSON.parse(fs.readFileSync(PATH_PREGUNTAS, 'utf8'));
const obtenerResultados = () => JSON.parse(fs.readFileSync(PATH_RESULTADOS, 'utf8'));

// ================= ENDPOINTS CONTROLADORES =================

app.post('/api/login', (req, res) => {
    const { cif, password } = req.body;
    const db_usuarios = obtenerUsuarios();
    const usuario = db_usuarios.find(u => u.cif === cif && u.password_hash === password);
    if (usuario) res.json({ success: true, user: usuario });
    else res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
});

app.get('/api/preguntas/p1', (req, res) => res.json(obtenerPreguntas().db_preguntas_p1));
app.get('/api/preguntas/p2', (req, res) => res.json(obtenerPreguntas().db_preguntas_p2));
app.get('/api/resultados', (req, res) => res.json(obtenerResultados()));

app.post('/api/respuestas', (req, res) => {
    const { id_aspirante, respuestasP1, respuestasP2 } = req.body;
    const db_usuarios = obtenerUsuarios();
    const db_resultados = obtenerResultados();
    
    const usuario = db_usuarios.find(u => u.id_aspirante === id_aspirante);
    const scores = calcularResultadosAllport(respuestasP1, respuestasP2);

    const index = db_resultados.findIndex(r => r.id_resultado === id_aspirante);
    const item = {
        id_resultado: id_aspirante,
        nombre: usuario ? usuario.nombre_aspirante : "Aspirante",
        cif: usuario ? usuario.cif : "N/A",
        email: "tu_correo_real_aqui@gmail.com", 
        total_teorico: scores.teorica,
        total_economico: scores.economico,
        total_estetico: scores.estetico,
        total_social: scores.social,
        total_politico: scores.politico,
        total_religioso: scores.religioso,
        estado_evaluacion: "Completado",
        notes_entrevista: "",
        respuestas_guardadas: { respuestasP1, respuestasP2 }
    };

    if (index !== -1) db_resultados[index] = item;
    else db_resultados.push(item);

    guardarEnDisco(PATH_RESULTADOS, db_resultados);
    res.json({ success: true, message: "Respuestas evaluadas y guardadas con éxito." });
});

app.post('/api/entrevista/:id', (req, res) => {
    const { notas } = req.body;
    const db_resultados = obtenerResultados();
    const item = db_resultados.find(r => r.id_resultado == req.params.id);
    if (item) {
        item.notas_entrevista = notas;
        item.estado_evaluacion = "Entrevistado";
        guardarEnDisco(PATH_RESULTADOS, db_resultados);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Aspirante no encontrado." });
    }
});

app.post('/api/enviar-correo/:id', async (req, res) => {
    const { emailPersonalizado } = req.body; 
    const db_resultados = obtenerResultados();
    const item = db_resultados.find(r => r.id_resultado == req.params.id);
    
    if (!item) {
        return res.status(404).json({ success: false, message: "Aspirante no encontrado." });
    }

    try {
        await enviarReporteAxiologico(item, emailPersonalizado);
        item.estado_evaluacion = "Resultados Enviados";
        guardarEnDisco(PATH_RESULTADOS, db_resultados);
        res.json({ success: true, message: `Expediente transmitido con éxito vía Gmail a: ${emailPersonalizado}` });
    } catch (error) {
        console.error("Error en la pasarela SMTP de Gmail:", error);
        res.status(500).json({ success: false, message: "Falla al despachar el correo." });
    }
});

// ================= CRUD ENDPOINTS PARA ADMINISTRADOR =================

// 🔍 NUEVO ENDPOINT: Devuelve la lista real completa desde usuarios.json
app.get('/api/admin/usuarios', (req, res) => {
    res.json(obtenerUsuarios());
});

app.post('/api/admin/usuarios', (req, res) => {
    const { nombre_aspirante, cif, password_hash, rol } = req.body;
    const db_usuarios = obtenerUsuarios();
    const nuevoId = db_usuarios.length > 0 ? Math.max(...db_usuarios.map(u => u.id_aspirante)) + 1 : 1;
    const nuevoUsuario = { id_aspirante: nuevoId, nombre_aspirante, cif, password_hash, rol };
    db_usuarios.push(nuevoUsuario);
    
    guardarEnDisco(PATH_USUARIOS, db_usuarios);
    res.json({ success: true, user: nuevoUsuario });
});

app.delete('/api/admin/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db_usuarios = obtenerUsuarios();
    const index = db_usuarios.findIndex(u => u.id_aspirante === id);
    
    if (index !== -1) {
        db_usuarios.splice(index, 1);
        guardarEnDisco(PATH_USUARIOS, db_usuarios);
        return res.json({ success: true, message: "Usuario eliminado con éxito." });
    }
    res.status(404).json({ success: false, message: "Usuario no encontrado." });
});

app.post('/api/admin/preguntas/:parte', (req, res) => {
    const { parte } = req.params; 
    const { texto_item, opciones } = req.body;
    const dbs = obtenerPreguntas();
    
    if (parte === 'p1') {
        const nuevoId = dbs.db_preguntas_p1.length > 0 ? Math.max(...dbs.db_preguntas_p1.map(p => p.id_item)) + 1 : 1;
        dbs.db_preguntas_p1.push({ id_item: nuevoId, texto_item, seccion: "Parte 1" });
    } else {
        const nuevoId = dbs.db_preguntas_p2.length > 0 ? Math.max(...dbs.db_preguntas_p2.map(p => p.id_item)) + 1 : 1;
        dbs.db_preguntas_p2.push({ id_item: nuevoId, texto_item, opciones: opciones || [] });
    }
    
    guardarEnDisco(PATH_PREGUNTAS, dbs);
    res.json({ success: true, message: "Pregunta añadida con éxito." });
});

app.put('/api/admin/preguntas/:parte/:id', (req, res) => {
    const { parte, id } = req.params;
    const { texto_item, opciones } = req.body; 
    const idItem = parseInt(id);
    const dbs = obtenerPreguntas();

    if (parte === 'p1') {
        const item = dbs.db_preguntas_p1.find(p => p.id_item === idItem);
        if (item) item.texto_item = texto_item;
    } else {
        const item = dbs.db_preguntas_p2.find(p => p.id_item === idItem);
        if (item) {
            item.texto_item = texto_item;
            if (opciones && Array.isArray(opciones)) item.opciones = opciones;
        }
    }
    
    guardarEnDisco(PATH_PREGUNTAS, dbs);
    res.json({ success: true, message: "Pregunta y opciones actualizadas con éxito." });
});

app.delete('/api/admin/preguntas/:parte/:id', (req, res) => {
    const { parte, id } = req.params;
    const idItem = parseInt(id);
    const dbs = obtenerPreguntas();

    if (parte === 'p1') {
        const index = dbs.db_preguntas_p1.findIndex(p => p.id_item === idItem);
        if (index !== -1) dbs.db_preguntas_p1.splice(index, 1);
    } else {
        const index = dbs.db_preguntas_p2.findIndex(p => p.id_item === idItem);
        if (index !== -1) dbs.db_preguntas_p2.splice(index, 1);
    }
    
    guardarEnDisco(PATH_PREGUNTAS, dbs);
    res.json({ success: true, message: "Pregunta eliminada." });
});

app.listen(3001, () => console.log('Server Axiológico Modular Allport activo en puerto 3001 ya con persistencia supuestamente'));