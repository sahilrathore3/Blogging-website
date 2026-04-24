const {createTransport } = require('../service/nodeMailer');

exports.sendMail = async({ email, subject , content}) => {
    try {
         const transporter = await createTransport()
 
        const info = await transporter.sendMail({
              from: `${process.env.SMTP_APP_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: subject,
                html: content
        });
        return true
    } catch (error) {
           console.log("Mail Error :",error.message);
           throw error;
    }
}