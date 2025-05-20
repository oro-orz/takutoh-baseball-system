import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import PDFDocument from 'pdfkit';
import { getSession } from '@supabase/auth-helpers-nextjs';

const TAX_RATE = 0.10; // 消費税率10%

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { month, matchings, total } = req.body;

    // ユーザー情報を取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // 銀行口座情報を取得
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (bankError) throw bankError;

    // PDFの生成
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // レスポンスヘッダーの設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${month}.pdf`);

    // PDFをレスポンスストリームにパイプ
    doc.pipe(res);

    // 請求書の内容を生成
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // ヘッダー
    doc.fontSize(20).text('請求書', { align: 'center' });
    doc.moveDown();

    // 発行日と請求書番号
    doc.fontSize(10)
      .text(`発行日: ${today.toLocaleDateString('ja-JP')}`, { align: 'right' })
      .text(`請求書番号: INV-${month}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, { align: 'right' });
    doc.moveDown();

    // 宛先
    doc.fontSize(12)
      .text('株式会社Timingood 御中')
      .moveDown();

    // 請求元情報
    doc.fontSize(10)
      .text(`${profile.full_name}`)
      .text(`メールアドレス: ${profile.email}`)
      .text(`電話番号: ${profile.phone}`);
    
    // インボイス情報の表示
    if (profile.invoice_number) {
      doc.text(`インボイス番号: ${profile.invoice_number}`);
    }
    doc.moveDown();

    // 請求内容
    doc.fontSize(10)
      .text('下記の通りご請求申し上げます。')
      .text(`お支払い期限: ${dueDate.toLocaleDateString('ja-JP')}`);
    doc.moveDown();

    // 明細
    doc.fontSize(10);
    doc.text('明細', { underline: true });
    doc.moveDown();

    // テーブルヘッダー
    const tableTop = doc.y;
    doc.text('企業名', 50, tableTop)
      .text('日付', 250, tableTop)
      .text('金額', 400, tableTop, { align: 'right' });
    doc.moveDown();

    // 明細行と金額計算
    let currentY = doc.y;
    let subtotal = 0;
    let taxAmount = 0;

    matchings.forEach((matching: any) => {
      const amount = matching.amount;
      if (profile.invoice_number) {
        // インボイス制度対応の場合（税別）
        const taxIncluded = amount;
        const taxExcluded = Math.floor(taxIncluded / (1 + TAX_RATE));
        const tax = taxIncluded - taxExcluded;
        
        doc.text(matching.companyName, 50, currentY)
          .text(new Date(matching.date).toLocaleDateString('ja-JP'), 250, currentY)
          .text(`¥${taxExcluded.toLocaleString()}`, 400, currentY, { align: 'right' });
        
        subtotal += taxExcluded;
        taxAmount += tax;
      } else {
        // インボイス制度非対応の場合（税込）
        doc.text(matching.companyName, 50, currentY)
          .text(new Date(matching.date).toLocaleDateString('ja-JP'), 250, currentY)
          .text(`¥${amount.toLocaleString()}`, 400, currentY, { align: 'right' });
        
        subtotal += amount;
      }
      currentY += 20;
    });

    // 合計金額の表示
    doc.moveDown();
    if (profile.invoice_number) {
      // インボイス制度対応の場合
      doc.text('小計', 250, doc.y)
        .text(`¥${subtotal.toLocaleString()}`, 400, doc.y, { align: 'right' });
      doc.moveDown();
      doc.text('消費税（10%）', 250, doc.y)
        .text(`¥${taxAmount.toLocaleString()}`, 400, doc.y, { align: 'right' });
      doc.moveDown();
      doc.fontSize(12)
        .text('合計', 250, doc.y)
        .text(`¥${total.toLocaleString()}`, 400, doc.y, { align: 'right' });
    } else {
      // インボイス制度非対応の場合
      doc.fontSize(12)
        .text('合計（税込）', 250, doc.y)
        .text(`¥${total.toLocaleString()}`, 400, doc.y, { align: 'right' });
    }
    doc.moveDown(2);

    // 振込先情報
    doc.fontSize(10)
      .text('振込先口座情報', { underline: true })
      .moveDown()
      .text(`銀行名: ${bankAccount.bank_name}`)
      .text(`支店名: ${bankAccount.branch_name}`)
      .text(`口座種別: ${bankAccount.account_type}`)
      .text(`口座番号: ${bankAccount.account_number}`)
      .text(`口座名義: ${bankAccount.account_holder}`);

    // PDFの生成を完了
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: '請求書の生成に失敗しました' });
  }
} 