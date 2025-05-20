interface EmailTemplate {
  subject: string;
  html: string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  resetPassword: {
    subject: '【LookMate】パスワードリセットのご案内',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://lookmate.example.com/logo.png" alt="LookMate" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">パスワードリセットのご案内</h1>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            いつもLookMateをご利用いただき、ありがとうございます。<br>
            パスワードリセットのリクエストを受け付けました。
          </p>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            以下のボタンをクリックして、新しいパスワードを設定してください。<br>
            このリンクは24時間有効です。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              パスワードをリセット
            </a>
          </div>
          
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ※このメールに心当たりがない場合は、お手数ですが破棄してください。<br>
            ※このメールは自動送信されています。返信はできませんのでご注意ください。
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 LookMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
  
  passwordChanged: {
    subject: '【LookMate】パスワード変更完了のお知らせ',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://lookmate.example.com/logo.png" alt="LookMate" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">パスワード変更完了</h1>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            いつもLookMateをご利用いただき、ありがとうございます。<br>
            パスワードの変更が完了しました。
          </p>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            新しいパスワードでログインできます。<br>
            もし心当たりのない変更があった場合は、すぐにサポートまでご連絡ください。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .SiteURL }}/login" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ログインページへ
            </a>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 LookMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },

  signup: {
    subject: '【LookMate】メールアドレス確認のお願い',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://lookmate.example.com/logo.png" alt="LookMate" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">メールアドレスの確認</h1>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            LookMateへのご登録ありがとうございます。<br>
            メールアドレスの確認をお願いいたします。
          </p>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            以下のボタンをクリックして、メールアドレスの確認を完了してください。<br>
            このリンクは24時間有効です。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              メールアドレスを確認
            </a>
          </div>
          
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ※このメールに心当たりがない場合は、お手数ですが破棄してください。<br>
            ※このメールは自動送信されています。返信はできませんのでご注意ください。
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 LookMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },

  signupComplete: {
    subject: '【LookMate】新規登録完了のお知らせ',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://lookmate.example.com/logo.png" alt="LookMate" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">新規登録完了</h1>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            LookMateへのご登録ありがとうございます。<br>
            メールアドレスの確認が完了し、アカウントの作成が完了しました。
          </p>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            以下のボタンからログインして、サービスをご利用ください。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .SiteURL }}/login" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ログインページへ
            </a>
          </div>

          <div style="background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">次のステップ</h2>
            <ul style="color: #4a4a4a; font-size: 14px; line-height: 1.6; list-style-type: none; padding: 0;">
              <li style="margin-bottom: 10px;">✓ プロフィール情報の入力</li>
              <li style="margin-bottom: 10px;">✓ プロフィール画像のアップロード</li>
              <li style="margin-bottom: 10px;">✓ 活動内容の設定</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 LookMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
}; 