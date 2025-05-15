/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { SpeechClient } from '@google-cloud/speech'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import { Storage } from '@google-cloud/storage'
import { OpenAI } from 'openai'
import archiver from 'archiver'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const rm = promisify(fs.rm)
const access = promisify(fs.access)

// 認証情報の設定
let credentials;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
}

const speechClient = new SpeechClient({ credentials });
const visionClient = new ImageAnnotatorClient({ credentials });
const storage = new Storage({ credentials });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'your-bucket-name';

export async function POST(req: Request) {
  let tempDir = '';
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-analysis-'))
    const videoPath = path.join(tempDir, 'input.mp4')
    await writeFile(videoPath, buffer)

    // 並列処理の実行
    const [screenshots, transcription, ocrText] = await Promise.all([
      generateScreenshots(videoPath, tempDir),
      performSpeechToText(videoPath),
      generateScreenshots(videoPath, tempDir).then(performOCR)
    ]);

    console.log(`Generated ${screenshots.length} screenshots`)
    console.log('Speech-to-text completed')
    console.log('OCR processing completed')

    const empathyMap = await generateEmpathyMap(transcription)
    console.log('Empathy map generated')

    const zipPath = path.join(tempDir, `${file.name}.zip`)
    await createZipFile(screenshots, zipPath)

    const zipBuffer = await readFile(zipPath)
    const zipBase64 = zipBuffer.toString('base64')

    const screenshotBase64 = await Promise.all(
      screenshots.map(async (s) => {
        const content = await readFile(s)
        return `data:image/jpeg;base64,${content.toString('base64')}`
      })
    )

    return NextResponse.json({
      screenshots: screenshotBase64,
      transcription,
      ocrText,
      empathyMap,
      zipUrl: `data:application/zip;base64,${zipBase64}`,
      zipFileName: `${file.name}.zip`,
    })
  } catch (error) {
    console.error('Error processing request:', error)
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      if ('code' in error && typeof error.code === 'number') {
        statusCode = error.code
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(console.error)
    }
  }
}

async function generateScreenshots(videoPath: string, outputDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const screenshots: string[] = []
    ffmpeg(videoPath)
      .on('filenames', (filenames) => {
        screenshots.push(...filenames.map(f => path.join(outputDir, f)))
      })
      .on('end', () => resolve(screenshots))
      .on('error', (err) => reject(err))
      .screenshots({
        count: 9,
        folder: outputDir,
        filename: 'screenshot-%i.png',
        timemarks: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%']
      })
  })
}

async function performSpeechToText(videoPath: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const gcsUri = `gs://${bucketName}/${path.basename(videoPath)}`;

  await bucket.upload(videoPath, {
    destination: path.basename(videoPath),
  });

  const audio = {
    uri: gcsUri,
  };
  const config = {
    encoding: 'MP3' as const,
    sampleRateHertz: 16000,
    languageCode: 'ja-JP',
  };
  const request = {
    audio: audio,
    config: config,
  };

  try {
    const operationResult = await speechClient.longRunningRecognize(request);
    const operation = Array.isArray(operationResult) ? operationResult[0] : operationResult;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [response] = await operation.promise();
    return response.results?.map((result: any) => result.alternatives?.[0].transcript).join('\n') || '';
  } finally {
    await bucket.file(path.basename(videoPath)).delete().catch(console.error);
  }
}

async function performOCR(imagePaths: string[]): Promise<string> {
  try {
    const existingFiles = await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          await access(imagePath, fs.constants.R_OK);
          return imagePath;
        } catch {
          console.warn(`File not found: ${imagePath}`);
          return null;
        }
      })
    );

    const validFiles = existingFiles.filter((file): file is string => file !== null);

    if (validFiles.length === 0) {
      throw new Error('No valid screenshot files found for OCR processing');
    }

    const requests = await Promise.all(validFiles.map(async (imagePath) => {
      const content = await readFile(imagePath);
      return {
        image: { content: content.toString('base64') },
        features: [{ type: 'TEXT_DETECTION' as const }],
      };
    }));

    const [result] = await visionClient.batchAnnotateImages({ requests });

    if (!result.responses) {
      throw new Error('No responses received from Vision API');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawOCRText = result.responses.map((r: any) => r.fullTextAnnotation?.text || '').join('\n') || '';
    return processOCRText(rawOCRText);
  } catch (error) {
    console.error('Error in OCR processing:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to perform OCR on images: ${error.message}`);
    } else {
      throw new Error('Failed to perform OCR on images: Unknown error');
    }
  }
}

async function processOCRText(ocrText: string): Promise<string> {
  // 1. 重複除去
  const lines = ocrText.split('\n');
  const uniqueLines = Array.from(new Set(lines));

  // 2. 言語フィルタリング（簡易的な実装）
  const japaneseLines = uniqueLines.filter(line => /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(line));

  // 3. & 4. 文脈に基づくフィルタリングとテキストのクリーンアップ
  const cleanedText = japaneseLines.join('\n');

  const prompt = `
    以下のテキストは動画のOCR結果です。このテキストを以下のルールに従って整理してください：

    1. 明らかに動画の字幕や説明文と思われる部分を抽出する
    2. 製品名や重要な情報は保持する
    3. 不要な記号や繰り返しを削除する
    4. 文脈に合わない単語や文を削除する
    5. 結果を論理的な順序で整理する

    元のテキスト：
    ${cleanedText}

    整理されたテキスト：
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "あなたは動画のOCR結果を整理する専門家です。" },
      { role: "user", content: prompt }
    ],
    max_tokens: 1000
  });

  return response.choices[0].message.content?.trim() || '';
}

async function generateEmpathyMap(transcription: string): Promise<string> {
  const prompt = `
    以下の文章は、広告クリエイティブの音声文字起こしです。この情報を元に、視聴者の感情や反応を予測したエンパシーマップを生成してください。
    以下の要素を含めて、詳細なエンパシーマップを作成してください：

    1. ターゲットユーザーの特定:
       - この広告クリエイティブの具体的なターゲットユーザーを定義してください。

    2. セグメンテーション:
       - ターゲットユーザーを年齢、性別、職業、趣味、ライフスタイルなどの観点からセグメント化してください。

    3. 感情の把握:
       - ターゲットユーザーが広告を目にしたとき、どのような感情を抱くと考えられるかをリストアップしてください。

    4. ニーズの明確化:
       - ターゲットユーザーが抱える問題やニーズは何か、どのように解決したいのかを具体的に記述してください。

    5. 行動の観察:
       - ターゲットユーザーがどのような行動を取るか、購買の意思決定に至るプロセスを分析してください。

    6. メッセージの検討:
       - ユーザーの心に響くためのメッセージや訴求ポイントは何かを考えてください。

    各要素について、箇条書きで3-5項目ずつ記述してください。
    回答は日本語で出力してください。
    
    音声文字起こし:
    ${transcription}
    
    エンパシーマップ:
  `

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "あなたは広告クリエイティブを分析し、詳細なエンパシーマップを生成する日本語AIアシスタントです。" },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000
    })

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error generating empathy map:', error);
    throw new Error('エンパシーマップの生成に失敗しました');
  }
}

async function createZipFile(files: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', resolve)
    archive.on('error', reject)

    archive.pipe(output)

    files.forEach(file => {
      archive.file(file, { name: path.basename(file) })
    })

    archive.finalize()
  })
}