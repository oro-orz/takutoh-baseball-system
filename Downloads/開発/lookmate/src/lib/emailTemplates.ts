import { supabase } from './supabase';
import { emailTemplates } from '../config/emailTemplates';

export const updateEmailTemplates = async () => {
  try {
    // パスワードリセットメールテンプレートの更新
    const { error: resetError } = await supabase.auth.admin.updateEmailTemplate({
      template: 'reset-password',
      subject: emailTemplates.resetPassword.subject,
      html: emailTemplates.resetPassword.html,
    });

    if (resetError) {
      throw resetError;
    }

    // パスワード変更完了メールテンプレートの更新
    const { error: changeError } = await supabase.auth.admin.updateEmailTemplate({
      template: 'change-password',
      subject: emailTemplates.passwordChanged.subject,
      html: emailTemplates.passwordChanged.html,
    });

    if (changeError) {
      throw changeError;
    }

    // 新規登録確認メールテンプレートの更新
    const { error: signupError } = await supabase.auth.admin.updateEmailTemplate({
      template: 'signup',
      subject: emailTemplates.signup.subject,
      html: emailTemplates.signup.html,
    });

    if (signupError) {
      throw signupError;
    }

    // 新規登録完了メールテンプレートの更新
    const { error: signupCompleteError } = await supabase.auth.admin.updateEmailTemplate({
      template: 'signup-complete',
      subject: emailTemplates.signupComplete.subject,
      html: emailTemplates.signupComplete.html,
    });

    if (signupCompleteError) {
      throw signupCompleteError;
    }

    console.log('メールテンプレートの更新が完了しました');
  } catch (error) {
    console.error('メールテンプレートの更新に失敗しました:', error);
    throw error;
  }
}; 