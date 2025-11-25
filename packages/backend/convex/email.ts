// Email actions using SMTP
'use node';

import { internalAction, action } from './_generated/server';
import { v } from 'convex/values';
import nodemailer from 'nodemailer';

const BASE_URL = process.env.BASE_URL || 'https://www.dohystudio.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Dohy';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

const getTransporter = () => {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
        throw new Error('SMTP configuration not set. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: false,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
        },
    });
};

const sendEmailViaSMTP = async (params: EmailParams): Promise<boolean> => {
    const { to, subject, html } = params;

    try {
        const transporter = getTransporter();
        const fromAddress = SMTP_FROM ? `"${SMTP_FROM_NAME}" <${SMTP_FROM}>` : `"${SMTP_FROM_NAME}" <${SMTP_USER}>`;

        const result = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send email via SMTP:', error);
        return false;
    }
};

export const sendContactFormEmail = internalAction({
    args: {
        adminEmail: v.string(),
        visitorName: v.string(),
        visitorEmail: v.string(),
        visitorPhone: v.optional(v.string()),
        serviceCategory: v.optional(v.string()),
        message: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { adminEmail, visitorName, visitorEmail, visitorPhone, serviceCategory, message } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-top: 0;
            }
            .info-row {
              margin: 15px 0;
              padding: 12px;
              background: #f8f9fa;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .info-row strong {
              color: #f59e0b;
              display: inline-block;
              min-width: 120px;
            }
            .info-row span {
              color: #333;
            }
            .message-box {
              margin: 20px 0;
              padding: 20px;
              background: #fff9e6;
              border: 1px solid #f59e0b;
              border-radius: 4px;
            }
            .message-box h3 {
              margin-top: 0;
              color: #f59e0b;
            }
            .message-content {
              color: #333;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 Yêu cầu liên hệ mới</h1>
            </div>
            <div class="content">
              <p class="greeting">Bạn đã nhận được một yêu cầu liên hệ từ khách hàng</p>
              
              <div class="info-row">
                <strong>Họ tên:</strong>
                <span>${visitorName}</span>
              </div>
              
              <div class="info-row">
                <strong>Email:</strong>
                <span><a href="mailto:${visitorEmail}" style="color: #f59e0b; text-decoration: none;">${visitorEmail}</a></span>
              </div>
              
              ${visitorPhone ? `
              <div class="info-row">
                <strong>Số điện thoại:</strong>
                <span><a href="tel:${visitorPhone}" style="color: #f59e0b; text-decoration: none;">${visitorPhone}</a></span>
              </div>
              ` : ''}
              
              ${serviceCategory ? `
              <div class="info-row">
                <strong>Danh mục dịch vụ:</strong>
                <span>${serviceCategory}</span>
              </div>
              ` : ''}
              
              <div class="message-box">
                <h3>💬 Tin nhắn:</h3>
                <div class="message-content">${message}</div>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Vui lòng phản hồi khách hàng này trong thời gian sớm nhất để giữ chất lượng dịch vụ.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động từ hệ thống liên hệ.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: adminEmail,
            subject: `[Liên hệ từ trang web] ${visitorName} - ${visitorEmail}`,
            html,
        });
    },
});

export const sendPasswordResetEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        resetToken: v.string(),
        resetLink: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, resetToken, resetLink } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              text-decoration: none;
              padding: 14px 40px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
              transition: opacity 0.3s;
            }
            .reset-button:hover {
              opacity: 0.9;
            }
            .link-text {
              font-size: 12px;
              color: #999;
              word-break: break-all;
              margin-top: 15px;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào ${studentName},</p>
              
              <p class="message">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.
              </p>

              <div class="button-container">
                <a href="${resetLink}" class="reset-button">Đặt lại mật khẩu</a>
                <p class="link-text">Hoặc truy cập: <br>${resetLink}</p>
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý bảo mật:</strong><br>
                Đường dẫn này chỉ có hiệu lực trong 24 giờ. Không chia sẻ đường dẫn này với bất kỳ ai.
              </div>

              <p class="message">
                Nếu bạn gặp vấn đề, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: 'Đặt lại mật khẩu tài khoản Dohy',
            html,
        });
    },
});

export const sendWelcomeEmail = internalAction({
    args: {
         studentEmail: v.string(),
        studentName: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .login-button {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              text-decoration: none;
              padding: 14px 40px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
              transition: opacity 0.3s;
            }
            .login-button:hover {
              opacity: 0.9;
            }
            .features {
              background: #f8f9fa;
              border-left: 4px solid #f7c948;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
            }
            .features li {
              margin: 8px 0;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chào mừng đến Dohy!</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào ${studentName},</p>
              
              <p class="message">
                Tài khoản của bạn đã được tạo thành công! Chúng tôi rất vui được chào đón bạn 
                vào cộng đồng học tập của Dohy.
              </p>

              <div class="features">
                <strong>Bạn có thể:</strong>
                <ul>
                  <li>📚 Truy cập hơn 100+ khóa học chất lượng cao</li>
                  <li>❤️ Thêm khóa học yêu thích vào danh sách</li>
                  <li>📊 Theo dõi tiến độ học tập của bạn</li>
                  <li>🏆 Nhận chứng chỉ hoàn thành khóa học</li>
                </ul>
              </div>

              <div class="button-container">
                <a href="${BASE_URL}/khoa-hoc" class="login-button">Bắt đầu học ngay</a>
              </div>

              <p class="message">
                Nếu bạn có bất kỳ câu hỏi, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: 'Chào mừng bạn đến với Dohy!',
            html,
        });
    },
});

export const sendOTPEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        otpCode: v.string(),
        expiresInMinutes: v.number(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, otpCode, expiresInMinutes } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .otp-box {
              background: #f8f9fa;
              border: 2px solid #f7c948;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: 700;
              font-family: 'Courier New', monospace;
              color: #f7c948;
              letter-spacing: 8px;
              word-break: break-all;
            }
            .otp-info {
              font-size: 13px;
              color: #999;
              margin-top: 15px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #856404;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Mã Xác Thực OTP</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào ${studentName},</p>

              <p class="message">
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Dohy của mình.
                Sử dụng mã OTP dưới đây để tiếp tục.
              </p>

              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
                <div class="otp-info">
                  Mã này sẽ hết hạn trong ${expiresInMinutes} phút
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý bảo mật:</strong><br>
                • Không bao giờ chia sẻ mã OTP này với bất kỳ ai<br>
                • Dohy sẽ không bao giờ yêu cầu bạn cung cấp mã OTP qua email<br>
                • Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này
              </div>

              <p class="message">
                Nếu bạn gặp vấn đề hoặc không yêu cầu đặt lại mật khẩu,
                vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: 'Mã OTP lấy lại mật khẩu - Dohy',
            html,
        });
    },
});

export const sendPaymentRequestToAdminEmail = internalAction({
    args: {
        studentName: v.string(),
        studentEmail: v.string(),
        courseId: v.string(),
        amount: v.number(),
        paymentId: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentName, studentEmail, amount, paymentId } = args;

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@dohystudio.com';

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>💳 Yêu cầu mua khóa học mới</h2>
            </div>
            <div class="content">
              <p><strong>Học viên:</strong> ${studentName}</p>
              <p><strong>Email:</strong> ${studentEmail}</p>
              <p><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND</p>

              <p style="margin-top: 20px;">Vui lòng kiểm tra chứng minh thanh toán và xác nhận trong admin dashboard.</p>

              <p style="margin-top: 20px;">
                <a href="${BASE_URL}/dashboard/payments" class="button">Xem chi tiết thanh toán</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: adminEmail,
            subject: `[Dohy] Học viên ${studentName} yêu cầu mua khóa - ${amount.toLocaleString('vi-VN')} VND`,
            html,
        });
    },
});

export const sendPaymentReceivedEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        amount: v.number(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, amount } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .status-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Chứng minh thanh toán đã nhận</h2>
            </div>
            <div class="content">
              <p>Xin chào ${studentName},</p>

              <p>Chúng tôi đã nhận được chứng minh thanh toán của bạn.</p>

              <div class="status-box">
                <strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND<br/>
                <strong>Trạng thái:</strong> Chờ xác nhận
              </div>

              <p>Admin sẽ xác nhận thanh toán trong vòng 24 giờ. Bạn sẽ nhận được email khi được phê duyệt.</p>

              <p style="margin-top: 20px; color: #999; font-size: 12px;">Nếu bạn có câu hỏi, vui lòng liên hệ hỗ trợ của chúng tôi.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: 'Chứng minh thanh toán đã nhận - Dohy',
            html,
        });
    },
});

export const sendCheckoutTransferEmails = internalAction({
    args: {
        adminEmail: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerName: v.optional(v.string()),
        orderNumber: v.string(),
        amount: v.number(),
        itemCount: v.number(),
    },
    returns: v.object({
        sentToAdmin: v.boolean(),
        sentToCustomer: v.boolean(),
    }),
    handler: async (_, args) => {
        const {
            adminEmail,
            customerEmail,
            customerName = "Khach hang",
            orderNumber,
            amount,
            itemCount,
        } = args;

        const currency = amount.toLocaleString("vi-VN");
        let sentToAdmin = false;
        let sentToCustomer = false;

        if (adminEmail) {
            const adminHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 16px;">
          <div style="max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(120deg, #fbbf24, #f59e0b); color: #111; padding: 14px 18px; font-weight: 700;">
              Khach da bam "Toi da chuyen khoan"
            </div>
            <div style="background: #ffffff; padding: 18px;">
              <p><strong>Ma don:</strong> ${orderNumber}</p>
              <p><strong>Tong tien:</strong> ${currency} VND</p>
              <p><strong>So san pham:</strong> ${itemCount}</p>
              <p><strong>Khach hang:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail ?? "Chua cap nhat"}</p>
              <p style="margin-top: 16px;">Vui long kiem tra giao dich va cap nhat trang thai don trong dashboard.</p>
              <a href="${BASE_URL}/dashboard/orders" style="display:inline-block;margin-top:12px;background:#fbbf24;color:#111;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Mo dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `;

            sentToAdmin = await sendEmailViaSMTP({
                to: adminEmail,
                subject: `[Dohy] Don #${orderNumber} da bao chuyen khoan`,
                html: adminHtml,
            });
        }

        if (customerEmail) {
            const customerHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #0b1021; padding: 16px;">
          <div style="max-width: 620px; margin: 0 auto; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; background: #0f172a; color: #e2e8f0;">
            <div style="background: linear-gradient(120deg, #22d3ee, #3b82f6); color: #0b1021; padding: 14px 18px; font-weight: 700;">
              Da nhan yeu cau thanh toan
            </div>
            <div style="padding: 18px;">
              <p>Chao ${customerName},</p>
              <p>Hệ thống đã nhận thông báo "Tôi đã chuyển khoản" của bạn.</p>
              <p><strong>Ma don:</strong> ${orderNumber}</p>
              <p><strong>So tien:</strong> ${currency} VND</p>
              <p><strong>Trang thai:</strong> Cho xac nhan thanh toan tu admin.</p>
              <p style="margin-top: 14px;">Ban se nhan email xac nhan ngay khi don duoc duyet.</p>
            </div>
          </div>
        </body>
      </html>
    `;

            sentToCustomer = await sendEmailViaSMTP({
                to: customerEmail,
                subject: `Da nhan yeu cau thanh toan don #${orderNumber}`,
                html: customerHtml,
            });
        }

        return { sentToAdmin, sentToCustomer };
    },
});

export const sendOrderActivatedEmail = internalAction({
    args: {
        customerEmail: v.string(),
        customerName: v.string(),
        orderNumber: v.string(),
        totalAmount: v.number(),
        items: v.array(
            v.object({
                name: v.string(),
                type: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
                slug: v.optional(v.string()),
            }),
        ),
    },
    returns: v.boolean(),
    handler: async (_, { customerEmail, customerName, orderNumber, totalAmount, items }) => {
        const libraryUrl = `${BASE_URL}/my-library`;
        const currency = totalAmount.toLocaleString("vi-VN");

        const productLink = (item: { type: string; slug?: string }) => {
            if (!item.slug) return null;
            if (item.type === "course") return `${BASE_URL}/khoa-hoc/${item.slug}`;
            if (item.type === "resource") return `${BASE_URL}/thu-vien/${item.slug}`;
            return `${BASE_URL}/vfx/${item.slug}`;
        };

        const itemsHtml = items
            .map((item) => {
                const link = productLink(item);
                const label =
                    item.type === "course" ? "Khóa học" : item.type === "resource" ? "Tài nguyên" : "VFX";

                return `<li style="margin-bottom:10px;">
                  <span style="display:inline-block;min-width:80px;font-weight:600;color:#0f172a;">${label}</span>
                  <span style="color:#0f172a;">${item.name}</span>
                  ${link ? `<div><a href="${link}" style="color:#2563eb;text-decoration:none;">Xem ngay</a></div>` : ""}
                </li>`;
            })
            .join("");

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
            .wrap { max-width: 640px; margin: 0 auto; padding: 24px; }
            .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 12px 30px rgba(15,23,42,0.08); overflow: hidden; }
            .header { background: linear-gradient(120deg, #22c55e, #16a34a); color: #ecfdf3; padding: 20px 24px; }
            .title { margin: 0; font-size: 20px; font-weight: 700; }
            .content { padding: 24px; }
            .cta { display: inline-block; margin-top: 18px; background: #0ea5e9; color: #0b1120; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; }
            .box { background: #f8fafc; border: 1px dashed #e2e8f0; padding: 16px; border-radius: 10px; margin: 16px 0; }
            ul { padding-left: 18px; margin: 12px 0 0; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <div class="header">
                <p class="title">Đơn hàng #${orderNumber} đã hoàn thành</p>
                <p style="margin:6px 0 0;font-size:13px;color:#d1fae5;">Bạn đã có thể tải VFX, tài nguyên và học khóa học ngay.</p>
              </div>
              <div class="content">
                <p style="margin:0 0 12px;">Chào ${customerName},</p>
                <p style="margin:0 0 12px;">Thanh toán đã được xác nhận. Tài khoản của bạn vừa được mở quyền truy cập cho các sản phẩm sau:</p>
                <div class="box">
                  <div style="font-weight:700;color:#0f172a;">Tổng thanh toán: ${currency} VND</div>
                  <ul>${itemsHtml}</ul>
                </div>
                <p style="margin:0 0 12px;">Nhấn nút bên dưới để vào ngay thư viện, tải file VFX, tài nguyên hoặc bắt đầu học.</p>
                <a class="cta" href="${libraryUrl}">Mở thư viện của tôi</a>
                <p style="margin:16px 0 0;font-size:13px;color:#475569;">Nếu cần hỗ trợ, hãy trả lời email này hoặc liên hệ đội ngũ Dohy.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: customerEmail,
            subject: `Đơn ${orderNumber} đã hoàn thành - Dohy`,
            html,
        });
    },
});

export const sendPaymentConfirmedEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        courseName: v.string(),
        courseSlug: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, courseName, courseSlug } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4caf50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { background: #4caf50; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 Thanh toán được xác nhận!</h2>
            </div>
            <div class="content">
              <p>Xin chào ${studentName},</p>

              <p>Thanh toán của bạn đã được xác nhận. Bạn giờ có thể bắt đầu học khóa học.</p>

              <h3 style="color: #667eea; margin-top: 30px;">${courseName}</h3>

              <p style="margin-top: 30px;">
                <a href="${BASE_URL}/khoa-hoc/${courseSlug}" class="button">Bắt đầu học ngay</a>
              </p>

              <p style="margin-top: 30px; color: #999; font-size: 12px;">
                Cảm ơn bạn đã chọn Dohy. Chúng tôi mong chờ thấy bạn thành công!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: `Chào mừng bạn đến với ${courseName} - Dohy`,
            html,
        });
    },
});

export const sendPaymentRejectedEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        reason: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, reason } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .reason-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
            .button { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Thanh toán bị từ chối</h2>
            </div>
            <div class="content">
              <p>Xin chào ${studentName},</p>

              <p>Thanh toán của bạn không được xác nhận vì lý do sau:</p>

              <div class="reason-box">
                <strong>Lý do:</strong> ${reason}
              </div>

              <p>Vui lòng kiểm tra lại thông tin thanh toán và thử lại.</p>

              <p style="margin-top: 30px;">
                <a href="${BASE_URL}/khoa-hoc" class="button">Quay lại để thử lại</a>
              </p>

              <p style="margin-top: 30px; color: #999; font-size: 12px;">
                Nếu bạn có câu hỏi, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: 'Thanh toán bị từ chối - Dohy',
            html,
        });
    },
});

export const sendOrderPlacedEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        courseName: v.string(),
        coursePrice: v.number(),
        orderId: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, courseName, coursePrice, orderId } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
              line-height: 1.8;
            }
            .order-details {
             background: #fefaed;
             border-left: 4px solid #f7c948;
             padding: 20px;
             margin: 30px 0;
             border-radius: 4px;
            }
            .order-detail-row {
             display: flex;
             justify-content: space-between;
             margin: 10px 0;
             font-size: 14px;
            }
            .order-label {
             font-weight: 600;
             color: #333;
            }
            .order-value {
             color: #f7c948;
             font-weight: 600;
            }
            .steps {
             background: #fafafa;
             border: 1px solid #e0e0e0;
             padding: 20px;
             margin: 20px 0;
             border-radius: 4px;
             font-size: 13px;
            }
            .steps strong {
             display: block;
             margin-bottom: 12px;
             color: #333;
             font-size: 14px;
            }
            .step-item {
             margin: 10px 0;
             padding-left: 20px;
             position: relative;
            }
            .step-item:before {
             content: "→";
             position: absolute;
             left: 0;
             font-weight: bold;
             color: #f7c948;
            }
            .button-container {
             text-align: center;
             margin: 30px 0;
            }
            .view-button {
             background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
             color: white;
             text-decoration: none;
             padding: 14px 40px;
             border-radius: 6px;
             font-weight: 600;
             display: inline-block;
             transition: opacity 0.3s;
            }
            .view-button:hover {
              opacity: 0.9;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Đơn hàng đã được đặt</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào ${studentName},</p>
              
              <p class="message">
                Cảm ơn bạn đã đặt hàng! 🎓 Chúng tôi đã nhận được yêu cầu mua khóa học của bạn. Dưới đây là chi tiết đơn hàng:
              </p>

              <div class="order-details">
                <div class="order-detail-row">
                  <span class="order-label">Khóa học:</span>
                  <span class="order-value">${courseName}</span>
                </div>
                <div class="order-detail-row">
                  <span class="order-label">Học phí:</span>
                  <span class="order-value">${coursePrice.toLocaleString('vi-VN')} VND</span>
                </div>
                <div class="order-detail-row">
                  <span class="order-label">Mã đơn hàng:</span>
                  <span class="order-value">${orderId}</span>
                </div>
              </div>

              <div class="steps">
                <strong>📝 Bước tiếp theo:</strong>
                <div class="step-item">Chuyển khoản đến tài khoản ngân hàng được cung cấp với nội dung thanh toán tương ứng</div>
                <div class="step-item">Sau khi chuyển khoản, quay lại trang đơn hàng để upload chứng minh thanh toán</div>
                <div class="step-item">Admin sẽ xác nhận thanh toán trong vài phút (thường là nhanh lắm)</div>
                <div class="step-item">Bạn sẽ nhận được email xác nhận và có quyền truy cập khóa học ngay lập tức</div>
              </div>

              <div class="button-container">
                <a href="${BASE_URL}/khoa-hoc/don-dat?orderId=${orderId}" class="view-button">Xem chi tiết đơn hàng</a>
              </div>

              <p class="message">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: `Đơn hàng #${orderId} - Khóa học ${courseName}`,
            html,
        });
    },
});

export const sendCourseOnboardingEmail = internalAction({
    args: {
        studentEmail: v.string(),
        studentName: v.string(),
        courseName: v.string(),
        courseSlug: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const { studentEmail, studentName, courseName, courseSlug } = args;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
              line-height: 1.8;
            }
            .course-info {
              background: #f0f7f0;
              border-left: 4px solid #4caf50;
              padding: 20px;
              margin: 30px 0;
              border-radius: 4px;
            }
            .course-name {
              font-size: 18px;
              font-weight: 600;
              color: #4caf50;
              margin-bottom: 10px;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .start-button {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              text-decoration: none;
              padding: 14px 40px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
              transition: opacity 0.3s;
            }
            .start-button:hover {
              opacity: 0.9;
            }
            .tips {
              background: #fafafa;
              border: 1px solid #e0e0e0;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
            }
            .tips strong {
              display: block;
              margin-bottom: 10px;
              color: #333;
            }
            .tips ul {
              margin: 0;
              padding-left: 20px;
            }
            .tips li {
              margin: 8px 0;
              color: #666;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Chúc mừng bạn!</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào ${studentName},</p>
              
              <p class="message">
                Đơn hàng của bạn đã được xác nhận thành công! 🎉 Bạn hiện đã có quyền truy cập vào khóa học dưới đây.
              </p>

              <div class="course-info">
                <div class="course-name">📚 ${courseName}</div>
                <p style="margin: 0; color: #666; font-size: 13px;">
                  Bạn đã sẵn sàng bắt đầu hành trình học tập của mình. Hãy đăng nhập vào tài khoản Dohy để xem bài học.
                </p>
              </div>

              <div class="button-container">
                <a href="${BASE_URL}/khoa-hoc/${courseSlug}" class="start-button">Bắt đầu học ngay</a>
              </div>

              <div class="tips">
                <strong>💡 Mẹo để bắt đầu:</strong>
                <ul>
                  <li>Đăng nhập vào tài khoản Dohy của bạn</li>
                  <li>Truy cập khóa học từ danh sách khóa học của bạn</li>
                  <li>Bắt đầu với bài học đầu tiên</li>
                  <li>Làm theo video hướng dẫn từng bước</li>
                  <li>Hoàn thành các bài tập để lấy chứng chỉ</li>
                </ul>
              </div>

              <p class="message">
                Nếu bạn gặp bất kỳ vấn đề nào hoặc có câu hỏi, vui lòng không ngần ngại liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return await sendEmailViaSMTP({
            to: studentEmail,
            subject: `Chúc mừng! Bạn đã được ghi danh vào khóa học ${courseName}`,
            html,
        });
    },
});

export const handleContactFormSubmission = action({
    args: {
        visitorName: v.string(),
        visitorEmail: v.string(),
        visitorPhone: v.optional(v.string()),
        serviceCategory: v.optional(v.string()),
        message: v.string(),
        adminEmail: v.string(),
    },
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
    }),
    handler: async (ctx, args) => {
        try {
            const { visitorName, visitorEmail, visitorPhone, serviceCategory, message, adminEmail } = args;

            if (!adminEmail) {
                return {
                    success: false,
                    message: "Không thể lấy thông tin liên hệ admin",
                };
            }

            // Build email HTML
            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f7c948 0%, #f59e0b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              background: white;
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-top: 0;
            }
            .info-row {
              margin: 15px 0;
              padding: 12px;
              background: #f8f9fa;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .info-row strong {
              color: #f59e0b;
              display: inline-block;
              min-width: 120px;
            }
            .info-row span {
              color: #333;
            }
            .message-box {
              margin: 20px 0;
              padding: 20px;
              background: #fff9e6;
              border: 1px solid #f59e0b;
              border-radius: 4px;
            }
            .message-box h3 {
              margin-top: 0;
              color: #f59e0b;
            }
            .message-content {
              color: #333;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .footer {
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              padding: 20px 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 Yêu cầu liên hệ mới</h1>
            </div>
            <div class="content">
              <p class="greeting">Bạn đã nhận được một yêu cầu liên hệ từ khách hàng</p>
              
              <div class="info-row">
                <strong>Họ tên:</strong>
                <span>${visitorName}</span>
              </div>
              
              <div class="info-row">
                <strong>Email:</strong>
                <span><a href="mailto:${visitorEmail}" style="color: #f59e0b; text-decoration: none;">${visitorEmail}</a></span>
              </div>
              
              ${visitorPhone ? `
              <div class="info-row">
                <strong>Số điện thoại:</strong>
                <span><a href="tel:${visitorPhone}" style="color: #f59e0b; text-decoration: none;">${visitorPhone}</a></span>
              </div>
              ` : ''}
              
              ${serviceCategory ? `
              <div class="info-row">
                <strong>Danh mục dịch vụ:</strong>
                <span>${serviceCategory}</span>
              </div>
              ` : ''}
              
              <div class="message-box">
                <h3>💬 Tin nhắn:</h3>
                <div class="message-content">${message}</div>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Vui lòng phản hồi khách hàng này trong thời gian sớm nhất để giữ chất lượng dịch vụ.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Dohy. Tất cả quyền được bảo lưu.</p>
              <p>Đây là email tự động từ hệ thống liên hệ.</p>
            </div>
          </div>
        </body>
      </html>
    `;

            // Send email
            const result = await sendEmailViaSMTP({
                to: adminEmail,
                subject: `[Liên hệ từ trang web] ${visitorName} - ${visitorEmail}`,
                html,
            });

            if (result) {
                return {
                    success: true,
                    message: "Email đã được gửi thành công",
                };
            } else {
                return {
                    success: false,
                    message: "Không thể gửi email",
                };
            }
        } catch (error) {
            console.error("Error handling contact form submission:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi xử lý biểu mẫu",
            };
        }
    },
});
