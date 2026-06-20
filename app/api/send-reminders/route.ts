import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, subscriptions, reminder_days } = await req.json();

    if (!email || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    let sentCount = 0;
    for (const sub of subscriptions) {
      const emailHtml = getEmailTemplate(sub.name, sub.price, sub.next_payment_date, reminder_days);

      await resend.emails.send({
        from: '訂閱管家 <onboarding@resend.dev>',
        to: email,
        subject: `🔔 續費提醒：您的 ${sub.name} 即將在 ${reminder_days} 天後扣款`,
        html: emailHtml,
      });
      sentCount++;
    }

    return NextResponse.json({ success: true, count: sentCount });
  } catch (err) {
    console.error('API Error:', err);
    const message = err instanceof Error ? err.message : '未知錯誤';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getEmailTemplate(serviceName: string, price: number, date: string, days: number) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0A0A0A; }
    .card { background-color: #161616; border-radius: 16px; overflow: hidden; border: 1px solid #27272a; }
    .header { background: linear-gradient(90deg, #D4A574, #C4956A); padding: 4px; }
    .content { padding: 40px; color: #ffffff; }
    .info-table { width: 100%; background-color: #0A0A0A; border-radius: 8px; margin: 20px 0; border-collapse: separate; border-spacing: 0; }
    .info-table td { padding: 16px; border-bottom: 1px solid #27272a; color: #e4e4e7; }
    .info-table td:first-child { color: #a1a1aa; font-size: 14px; }
    .info-table tr:last-child td { border-bottom: none; }
    .btn { display: inline-block; background-color: #D4A574; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 14px 0 rgba(212, 165, 116, 0.5); }
    .footer { text-align: center; color: #52525b; font-size: 12px; padding: 20px; }
  </style>
</head>
<body style="background-color: #0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0A0A0A; padding: 40px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0; letter-spacing: 1px;">
              ⚡ Subscription <span style="color: #D4A574;">Tracker</span>
            </h1>
          </div>

          <div class="card">
            <div class="header"></div>

            <div class="content">
              <h2 style="margin-top: 0; font-size: 22px; color: #ffffff;">即將扣款通知 👋</h2>
              <p style="color: #d4d4d8; line-height: 1.6; font-size: 16px;">
                嗨！這是溫馨的小提醒。您的訂閱服務 <strong>${serviceName}</strong> 即將在 ${days} 天後進行自動扣款。
              </p>

              <p style="color: #d4d4d8; line-height: 1.6; font-size: 16px;">
                為了讓您掌握財務狀況，我們整理了本次扣款的詳細資訊：
              </p>

              <table class="info-table" width="100%">
                <tr>
                  <td width="30%">服務名稱</td>
                  <td style="font-weight: bold; font-size: 18px;">${serviceName}</td>
                </tr>
                <tr>
                  <td>扣款金額</td>
                  <td style="font-weight: bold; font-size: 18px; color: #D4A574;">NT$ ${price}</td>
                </tr>
                <tr>
                  <td>扣款日期</td>
                  <td>${date}</td>
                </tr>
              </table>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="btn">前往儀表板查看</a>
                <p style="margin-top: 16px; font-size: 14px; color: #52525b;">
                  如果不打算續約，請記得前往該服務官網取消。
                </p>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Designed for your Financial Freedom.</p>
            <p>© 2025 Subscription Tracker. All rights reserved.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
