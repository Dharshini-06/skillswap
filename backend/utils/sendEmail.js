const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER || "skillswap28@gmail.com",
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

/**
 * Generic email sender for existing features
 */
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `SkillSwap <${process.env.EMAIL_USER || "skillswap28@gmail.com"}>`,
    to,
    subject,
    text
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`Generic email sent to: ${to} (ID: ${info.messageId})`);
  return info;
};

/**
 * Specialized HTML email sender for Video Sessions
 */
const sendSessionEmail = async ({
  to,
  senderName,
  receiverName,
  skill,
  meetingLink,
  message,
  time,
  sessionType
}) => {
  try {
    const mailOptions = {
      from: `SkillSwap <${process.env.EMAIL_USER || "skillswap28@gmail.com"}>`,
      to,
      subject: "SkillSwap Session Invitation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; border-radius: 12px; background-color: #f9fafb; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color:#6366f1; margin: 0; font-size: 28px;">SkillSwap</h1>
            <p style="color: #6b7280; margin-top: 5px;">Knowledge Exchange Network</p>
          </div>

          <p>Hi <b>${receiverName}</b>,</p>

          <p>You have been invited for a skill exchange session with <b>${senderName}</b>.</p>

          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Session Details</p>
            <ul style="list-style: none; padding: 0; margin: 10px 0 0 0;">
              <li style="margin-bottom: 8px;"><strong>Type:</strong> ${sessionType === "teaching" ? "You will learn" : "You will teach"}</li>
              <li style="margin-bottom: 8px;"><strong>Skill:</strong> ${skill}</li>
              <li><strong>Time:</strong> ${time || "As discussed"}</li>
            </ul>
          </div>

          ${message ? `
          <div style="padding: 15px; background-color: #fef9c3; border-left: 4px solid #eab308; margin-bottom: 25px; border-radius: 4px;">
            <p style="margin: 0; color: #854d0e; font-size: 14px; font-style: italic;">"Message from ${senderName}: ${message}"</p>
          </div>
          ` : ''}

          <p style="color: #4b5563; line-height: 1.6;">You can join the session using the link below. We recommend joining on time for the best learning experience.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${meetingLink}" 
               style="display: inline-block; padding: 14px 32px; background:#6366f1; color:white; text-decoration:none; border-radius:10px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);">
               Join Session
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 35px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
            Best regards,<br/>
            SkillSwap Team
          </p>
        </div>
      `
    };



    console.log("Attempting to send session email to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error in sendSessionEmail:", error);
    throw error; // Rethrow to let the caller handle it
  }
};

module.exports = {
  sendEmail,
  sendSessionEmail
};
