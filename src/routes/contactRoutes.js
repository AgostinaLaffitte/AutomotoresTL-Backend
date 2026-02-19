const express = require('express');
const sgMail = require('@sendgrid/mail');
const router = express.Router();

// Configurar API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const to = process.env.CONTACT_TO;
    const cc = process.env.CONTACT_CC || undefined;

    const msg = {
      to,
      cc,
      from: 'agoslaffitte17@gmail.com', // tu correo verificado en SendGrid
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
      replyTo: email
    };

    await sgMail.send(msg);
    res.json({ ok: true, message: 'Correo enviado correctamente' });
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

module.exports = router;
