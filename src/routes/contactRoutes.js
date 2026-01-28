
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// opcional: verificar conexión SMTP al iniciar
transporter.verify().then(() => {
  console.log('SMTP listo para enviar');
}).catch(err => {
  console.error('Error SMTP:', err);
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const to = process.env.CONTACT_TO;
    const cc = process.env.CONTACT_CC || undefined;

    const mailOptions = {
      from: `"Automotores TL" <${process.env.SMTP_USER}>`,
      to,
      cc,
      subject: `Nuevo mensaje de contacto - ${name}`,
      html: `
        <h3>Nuevo mensaje desde el sitio</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
        <hr/>
        <small>Enviado automáticamente desde el formulario de contacto.</small>
      `,
      replyTo: email // para que tu cliente pueda responder directo al remitente
    };

    await transporter.sendMail(mailOptions);
    res.json({ ok: true, message: 'Correo enviado correctamente' });
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

module.exports = router;
