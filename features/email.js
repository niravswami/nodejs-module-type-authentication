import nodemailer from "nodemailer";
import ejs from "ejs";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default class Email {
	constructor(user, restParams = {}) {
		this.to = user.email;
		this.from = process.env.EMAIL_FROM;
		this.name = user.name;
		this.url = restParams?.url;
		this.restParams = restParams;
	}

	newTransport() {
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	async send(template, subject) {
		ejs.renderFile(
			`${__dirname}/../views/emailTemplates/${template}.ejs`,
			{ receiver: this.to, passwordResetLink: this.url },
			async (err, data) => {
				if (err) {
					console.log(err);
				} else {
					var mailOptions = {
						from: this.from,
						to: this.to,
						subject: subject,
						html: data,
					};

					this.newTransport().sendMail(mailOptions, (error, info) => {
						if (error) {
							return console.log(error);
						}
						console.log("Message sent: %s", info.messageId);
					});
				}
			}
		);
	}

	async sendPasswordReset() {
		await this.send(
			"passwordReset",
			"your password reset link (only valid for 10 min)"
		);
	}

	async sendWelcome() {
		await this.send("welcome", "Welcome to the Family!");
	}
}
