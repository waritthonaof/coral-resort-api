const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendEmail = async (template, subject, data) => {
  // 1. Render template
  const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
    firstName: data.user.name.split(' ')[0],
    url: data.url,
    subject,
  });

  // 2. email options
  const mailOptions = {
    from: `"Admin Coral-Resort" <${process.env.EMAI_FROM}>`,
    to: data.user.email,
    subject,
    html,
    text: convert(html),
  };

  // 3. and send the email
  if (process.env.NODE_ENV === 'production') {
    // sendgrid

    mailOptions.from = {
      name: 'Admin Coral Resort',
      email: 'waritthon.j@gmail.com',
    };

    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // mailtrap

    await createTransport().sendMail(mailOptions);
  }
};

exports.sendEmailResetPassword = async (user, url) => {
  try {
    await sendEmail(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
      { user, url }
    );
  } catch (err) {
    console.log(err.message);
  }
};
