function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    console.log("mailOptions", mailOptions);
    return resolve();
  });
}



async function sendVerificationEmail(user, req) {

  const token = user.generateVerificationToken();

  // Save the verification token
  await token.save();

  let subject = "Account Verification Token";
  let to = user.email;
  let from = process.env.FROM_EMAIL;
  let link = "http://" + req.headers.host + "/api/auth/verify/" + token.token;
  let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                <br><p>If you did not request this, please ignore this email.</p>`;

  await sendEmail({ to, from, subject, html });
}

module.exports = { sendEmail, sendVerificationEmail };
