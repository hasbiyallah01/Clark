const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendWaitlistMail = async (email: string, name: string) => {
  try {
    const mailOptions = {
      from: "Clark <no-reply>",
      to: email,
      subject: "You're on the Waitlist! Welcome to Clark",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Clark</title>
          <style>
              body {
                  font-family: 'Inter', sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 40px 0;
              }
              .container {
                  background: #ffffff;
                  max-width: 580px;
                  margin: auto;
                  padding: 40px;
                  border-radius: 12px;
                  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1);
                  text-align: center;
              }
              h1 {
                  color: #1d1d1f;
                  font-size: 28px;
                  font-weight: 600;
                  margin-bottom: 15px;
              }
              p {
                  color: #333;
                  font-size: 16px;
                  line-height: 1.7;
                  text-align: left;
              }
              .cta-button {
                  color: #007bff;
                  text-decoration: underline;
                  font-size: 16px;
                  font-weight: 600;
                  display: inline-block;
                  margin: 20px auto;
                  cursor: pointer;
              }
              .whatsapp-link {
                  background: #25D366;
                  color: #fff;
                  padding: 12px 24px;
                  border-radius: 8px;
                  display: inline-block;
                  font-size: 16px;
                  font-weight: 600;
                  text-decoration: none;
                  margin-top: 10px;
                  transition: all 0.3s ease;
              }
              .whatsapp-link:hover {
                  background: #1ea554;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #777;
                  text-align: center;
              }
              .features {
                  background: #f4f4f9;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: left;
              }
                  .image_{
                    width: 100%;
                    height: auto;
                    object-size: cover;
                  }
              ul {
                  padding-left: 20px;
              }
            li{
                margin-top: 10px;
                font-size: 16px;
            }
          </style>
      </head>
      <body>
          <div class="container">
            <img src="https://res.cloudinary.com/dd75ybtpr/image/upload/v1743187133/Twitter_header_clark_htcteb.png" class= "image_"/>
              <h1>Welcome to Clark, ${name.trim().split(" ").length > 1 ? name.trim().split(" ")[1] : name.trim()}!</h1>
              <p>Congratulations! You’ve secured a spot on the <strong>Clark Waitlist</strong>. You're now part of an exclusive group getting early access to the most intelligent AI-powered learning assistant.</p>
              
              <div class="features">
                  <p><strong>What Clark Offers:</strong></p>
                  <ul>
                      <li><strong>AI-Powered Study Assistant:</strong> Get instant, AI-driven learning support.</li>
                      <li><strong>Smart PDF Tools:</strong> Generate, enhance, and organize study PDFs effortlessly.</li>
                      <li><strong>AI-Generated Quizzes:</strong> Create personalized quizzes in seconds.</li>
                      <li><strong>Collaborative Whiteboard:</strong> Brainstorm and study together in real time.</li>
                  </ul>
              </div>

              <p>Be among the first to experience the future of AI-powered education. Join our WhatsApp community to stay updated and connect with fellow early adopters.</p>
              
              <a href="https://clarkai.vercel.app/" class="cta-button">Visit Clark</a>
              <br>
              <a href="https://chat.whatsapp.com/CAfbsIBoNjGK8EnwT4yRv5" class="whatsapp-link">Join Our WhatsApp Community</a>
  
              <div class="footer">
                  <p>Best,</p>
                  <p><strong>The Clark Team</strong></p>
              </div>
          </div>
      </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, async (error: any, info: any) => {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Welcome email sent: ", info.response);
        return true;
      }
    });
  } catch (error) {
    console.log("Error: ", error);
    return "Error sending email";
  }
};
