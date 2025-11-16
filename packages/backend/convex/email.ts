// Email actions using Resend
'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendEmailParams {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

const sendEmailViaResend = async (params: ResendEmailParams): Promise<boolean> => {
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not set');
        return false;
    }

    const { to, subject, html, from = 'noreply@dohy.dev' } = params;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Resend API error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
};

export const sendPasswordResetEmail = action({
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
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        return await sendEmailViaResend({
            to: studentEmail,
            subject: 'Đặt lại mật khẩu tài khoản Dohy',
            html,
        });
    },
});

export const sendWelcomeEmail = action({
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
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .login-button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
              border-left: 4px solid #667eea;
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
                <a href="https://dohy.dev/khoa-hoc" class="login-button">Bắt đầu học ngay</a>
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

        return await sendEmailViaResend({
            to: studentEmail,
            subject: 'Chào mừng bạn đến với Dohy!',
            html,
        });
    },
});
