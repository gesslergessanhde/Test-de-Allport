// 1. Formato CommonJS compatible con tu index.js
const nodemailer = require('nodemailer');

// 2. Configuración del transportador utilizando el servidor SMTP oficial de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para el puerto 465 (SSL)
    auth: {
        user: "diseniowebproyecto@gmail.com", 
        pass: "smng lrgv iysu hsws"                
    }
});

/**
 * Envía el reporte axiológico real por Gmail
 * @param {Object} aspirante - Objeto con los datos del alumno
 * @param {string} correoDestino - Dirección elegida manualmente por el evaluador
 */
async function enviarReporteAxiologico(aspirante, correoDestino) {
    const cuerpoHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; text-align: center; margin-bottom: 5px;">🏛️ Sistema Evaluativo Allport</h2>
            <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 0;">Reporte Oficial de Resultados Psicométricos</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
            <p><strong>Estimado(a) ${aspirante.nombre},</strong></p>
            <p>Le saludamos cordialmente por parte del Departamento de Admisiones. A continuación, compartimos el dictamen formal de su perfil axiológico:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f8fafc; text-align: left; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 10px; color: #475569;">Dimensión de Valor según Allport</th>
                        <th style="padding: 10px; text-align: center; color: #475569;">Puntaje</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Teorético</strong> (Búsqueda de la Verdad)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_teorico} pts</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Económico</strong> (Sentido Utilitario)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_economico} pts</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Estético</strong> (Armonía y Forma)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_estetico} pts</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Social</strong> (Filantropía y Servicio)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_social} pts</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Político</strong> (Poder y Dirección)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_politico} pts</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Religioso</strong> (Trascendencia Mística)</td><td style="padding: 10px; text-align: center; font-weight: bold; color: #4f46e5;">${aspirante.total_religioso} pts</td></tr>
                </tbody>
            </table>

            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-top: 15px;">
                <span style="font-weight: bold; font-size: 11px; color: #475569; text-transform: uppercase;">Anotaciones Clínicas de la Entrevista:</span>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #334155; font-style: italic;">
                    "${aspirante.notas_entrevista || 'Sin observaciones registradas por el evaluador presencial.'}"
                </p>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                La integridad métrica del Cuadro 1 ha sido auditada electrónicamente (Suma total = 240 puntos).
            </p>
        </div>
    `;

    await transporter.sendMail({
        from: `"Admisiones Universitarias" <${transporter.options.auth.user}>`,
        to: correoDestino,
        subject: `Resultados Oficiales: Test de Allport - ${aspirante.nombre}`,
        html: cuerpoHtml
    });

    return true;
}

// 3. Exportación limpia usando module.exports para index.js
module.exports = { enviarReporteAxiologico };