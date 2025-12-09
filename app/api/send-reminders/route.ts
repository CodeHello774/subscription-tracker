import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 使用 Service Role Key 以讀取所有使用者的資料
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. 找出「三天後」要扣款的訂閱
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const targetDate = threeDaysLater.toISOString().split('T')[0];

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, users:user_id (email)')
      .eq('next_payment_date', targetDate);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: '今天沒有人需要被提醒' });
    }

    // 2. 寄信給這些人
    let sentCount = 0;
    for (const sub of subscriptions) {
      // @ts-ignore
      const userEmail = sub.users?.email;
      
      if (userEmail) {
        // 生成專業的 HTML 內容
        const emailHtml = getEmailTemplate(sub.name, sub.price, sub.next_payment_date);

        await resend.emails.send({
          from: '訂閱管家 <onboarding@resend.dev>',
          to: userEmail,
          subject: `🔔 續費提醒：您的 ${sub.name} 即將在 3 天後扣款`,
          html: emailHtml,
        });
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, count: sentCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🎨 這裡就是那個「完美且專業」的深色 Email 模板
function getEmailTemplate(serviceName: string, price: number, date: string) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>訂閱扣款提醒</title>
  <style>
    /* 為了相容性，我們盡量寫 Inline CSS，但這裡放一些重置樣式 */
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; }
    .card { background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    .header { background: linear-gradient(90deg, #7c3aed, #2563eb); padding: 4px; }
    .content { padding: 40px; color: #ffffff; }
    .info-table { width: 100%; background-color: #0f172a; border-radius: 8px; margin: 20px 0; border-collapse: separate; border-spacing: 0; }
    .info-table td { padding: 16px; border-bottom: 1px solid #334155; color: #e2e8f0; }
    .info-table td:first-child { color: #94a3b8; font-size: 14px; }
    .info-table tr:last-child td { border-bottom: none; }
    .btn { display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.5); }
    .footer { text-align: center; color: #64748b; font-size: 12px; padding: 20px; }
  </style>
</head>
<body style="background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 40px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0; letter-spacing: 1px;">
              ⚡ Subscription <span style="color: #a78bfa;">Tracker</span>
            </h1>
          </div>

          <div class="card">
            <div class="header"></div>
            
            <div class="content">
              <h2 style="margin-top: 0; font-size: 22px; color: #ffffff;">即將扣款通知 👋</h2>
              <p style="color: #cbd5e1; line-height: 1.6; font-size: 16px;">
                嗨！這是溫馨的小提醒。您的訂閱服務 <strong>${serviceName}</strong> 即將在 3 天後進行自動扣款。
              </p>
              
              <p style="color: #cbd5e1; line-height: 1.6; font-size: 16px;">
                為了讓您掌握財務狀況，我們整理了本次扣款的詳細資訊：
              </p>

              <table class="info-table" width="100%">
                <tr>
                  <td width="30%">服務名稱</td>
                  <td style="font-weight: bold; font-size: 18px;">${serviceName}</td>
                </tr>
                <tr>
                  <td>扣款金額</td>
                  <td style="font-weight: bold; font-size: 18px; color: #a78bfa;">NT$ ${price}</td>
                </tr>
                <tr>
                  <td>扣款日期</td>
                  <td>${date}</td>
                </tr>
              </table>

              <div style="text-align: center;">
                <a href="http://localhost:3000/dashboard" class="btn">前往儀表板查看</a>
                <p style="margin-top: 16px; font-size: 14px; color: #64748b;">
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