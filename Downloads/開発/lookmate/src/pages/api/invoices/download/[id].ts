import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';
import PDFDocument from 'pdfkit';
import { getSession } from '@supabase/auth-helpers-nextjs';

const TAX_RATE = 0.10; // 消費税率10%

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    // 支払い情報を取得
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        profiles:influencer_id (
          full_name,
          email,
          phone,
          invoice_number
        )
      `)
      .eq('id', id)
      .single();

    if (paymentError) throw paymentError;

    // マッチング情報を取得
    const { data: matchings, error: matchingsError } = await supabase
      .from('matchings')
      .select(`
        *,
        companies:company_id (
          name
        )
      `)
      .eq('payment_id', id);

    if (matchingsError) throw matchingsError;

    // PDFの生成
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // レスポンスヘッダーの設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${payment.invoice_number}.pdf`);

    // PDFをレスポンスストリームにパイプ
    doc.pipe(res);

    // 請求書の内容を生成
    const today = new Date();
    const dueDate = new Date(payment.due_date);

    // ヘッダー
    doc.fontSize(20).text('請求書', { align: 'center' });
    doc.moveDown();

    // 発行日と請求書番号
    doc.fontSize(10)
      .text(`発行日: ${today.toLocaleDateString('ja-JP')}`, { align: 'right' })
      .text(`請求書番号: ${payment.invoice_number}`, { align: 'right' });
    doc.moveDown();

    // 宛先
    doc.fontSize(12)
      .text('株式会社Timingood 御中')
      .moveDown();

    // 請求元情報
    doc.fontSize(10)
      .text(`${payment.profiles.full_name}`)
      .text(`メールアドレス: ${payment.profiles.email}`)
      .text(`電話番号: ${payment.profiles.phone}`);
    
    // インボイス情報の表示
    if (payment.profiles.invoice_number) {
      doc.text(`インボイス番号: ${payment.profiles.invoice_number}`);
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

    matchings.forEach((matching) => {
      const amount = matching.amount;
      if (payment.profiles.invoice_number) {
        // インボイス制度対応の場合（税別）
        const taxIncluded = amount;
        const taxExcluded = Math.floor(taxIncluded / (1 + TAX_RATE));
        const tax = taxIncluded - taxExcluded;
        
        doc.text(matching.companies.name, 50, currentY)
          .text(new Date(matching.date).toLocaleDateString('ja-JP'), 250, currentY)
          .text(`¥${taxExcluded.toLocaleString()}`, 400, currentY, { align: 'right' });
        
        subtotal += taxExcluded;
        taxAmount += tax;
      } else {
        // インボイス制度非対応の場合（税込）
        doc.text(matching.companies.name, 50, currentY)
          .text(new Date(matching.date).toLocaleDateString('ja-JP'), 250, currentY)
          .text(`¥${amount.toLocaleString()}`, 400, currentY, { align: 'right' });
        
        subtotal += amount;
      }
      currentY += 20;
    });

    // 合計金額の表示
    doc.moveDown();
    if (payment.profiles.invoice_number) {
      // インボイス制度対応の場合
      doc.text('小計', 250, doc.y)
        .text(`¥${subtotal.toLocaleString()}`, 400, doc.y, { align: 'right' });
      doc.moveDown();
      doc.text('消費税（10%）', 250, doc.y)
        .text(`¥${taxAmount.toLocaleString()}`, 400, doc.y, { align: 'right' });
      doc.moveDown();
      doc.fontSize(12)
        .text('合計', 250, doc.y)
        .text(`¥${payment.amount.toLocaleString()}`, 400, doc.y, { align: 'right' });
    } else {
      // インボイス制度非対応の場合
      doc.fontSize(12)
        .text('合計（税込）', 250, doc.y)
        .text(`¥${payment.amount.toLocaleString()}`, 400, doc.y, { align: 'right' });
    }
    doc.moveDown(2);

    // 振込先情報
    doc.fontSize(10)
      .text('振込先口座情報', { underline: true })
      .moveDown()
      .text(`銀行名: ${payment.bank_name}`)
      .text(`支店名: ${payment.branch_name}`)
      .text(`口座種別: ${payment.account_type}`)
      .text(`口座番号: ${payment.account_number}`)
      .text(`口座名義: ${payment.account_holder}`);

    // PDFの生成を完了
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: '請求書の生成に失敗しました' });
  }
} 