const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, doctorName, password) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.doctorName = doctorName;
    this.password = password;
    this.from = `Tony Samy <${process.env.SENT_FROM}>`;
  }
  newTransport() {
    // Sendgrid
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  async send(template, subject) {
    // Send the actual email
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      doctorName: this.doctorName,
      password: this.password,
      subject,
    });
    let data = {
      from: this.from,
      subject,
      text: htmlToText.htmlToText(html),
      to: this.to,
      html,
    };
    let transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    try {
      console.log("sending.....");
      // await this.newTransport().sendMail(mailOptions);
      await transporter.sendMail(data);
    } catch (error) {
      console.error(error);
    }
    // await transporter.sendMail(mailOptions)
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
  async sendUpdate() {
    await this.send("sendUpdateReport", "Your profile has been updated");
  }
};
