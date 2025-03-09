const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 密码加密
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 密码验证
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 发送邮件
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  sendEmail
};