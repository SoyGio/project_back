const nodemailer = require('nodemailer');
function sendEmail(to, name, message, callback) {
	let transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'noreply.mocks@gmail.com',
	        pass: 'Rojo1234'
	    }
	});

  // Message object
	let mailOptions = {
		from: 'Test Verify Message <noreply.mocks@gmail.com>',
			to: to, 
			subject: 'Registro exitoso en pockets-gio',
			text: 'mensaje de prueba',
			html: '<p><b>Hola ' + name + '</b>, este es un mensaje de confirmación. <b>FAVOR DE NO RESPONDER</b></p><p>Se ha realizado exitosamente tu registro en '+
				'https://pockets-gio.firebaseapp.com</p><p>Tus datos son los siguientes: </p>' + message + '<br><img src="https://www.marketingdirecto.com/wp-content/uploads/2011/04/newsletter2.jpg">' + 
				'<br><br><br><br><br><b>FAVOR DE NO RESPONDER</b><br>Mensaje enviado automáticamente desde app mock de Giovanni Nicolás Marín.<br><b>FAVOR DE NO RESPONDER</b>'
	};

	let data = {
		code: 'ERR', 
		message: 'Ocurrió un error al intentar enviar el correo'
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	  	data.message = error.message;
	  } else {
	    data.code = 'OK';
	    data.message = "El correo fue enviado correctamente";
	    data.id = info.messageId;
	  }
	  return callback(data);
	});
}
module.exports = { sendEmail };