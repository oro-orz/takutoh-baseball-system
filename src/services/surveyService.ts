import { supabase } from './supabase'
import { Survey, SurveyQuestion, SurveyResponse, SurveyQuestionType, SurveyAnswerValue } from '../types'

interface SurveyInsert {
  title: string
  description?: string
  created_by?: string | null
  due_date?: string | null
}

interface QuestionInsert {
  survey_id: string
  question_text: string
  question_type: SurveyQuestionType
  options?: string[] | null
  sort_order: number
}

interface ResponseUpsert {
  survey_id: string
  respondent_id?: string | null
  answers: Record<string, SurveyAnswerValue>
}

const mapSurvey = (data: any): Survey => ({
  id: data.id,
  title: data.title,
  description: data.description ?? undefined,
  dueDate: data.due_date ?? undefined,
  createdBy: data.created_by ?? undefined,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

const mapQuestion = (data: any): SurveyQuestion => ({
  id: data.id,
  surveyId: data.survey_id,
  questionText: data.question_text,
  questionType: data.question_type,
  options: data.options ?? undefined,
  sortOrder: data.sort_order,
})

const mapResponse = (data: any): SurveyResponse => ({
  id: data.id,
  surveyId: data.survey_id,
  respondentId: data.respondent_id ?? undefined,
  answers: data.answers ?? {},
  submittedAt: data.submitted_at,
})

export const surveyService = {
  async getSurveys(): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('アンケート一覧の取得に失敗しました:', error)
      throw error
    }

    return (data ?? []).map(mapSurvey)
  },

  async createSurvey(payload: SurveyInsert): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('アンケート作成に失敗しました:', error)
      throw error
    }

    return mapSurvey(data)
  },

  async getSurveyQuestions(surveyId: string): Promise<SurveyQuestion[]> {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('設問一覧の取得に失敗しました:', error)
      throw error
    }

    return (data ?? []).map(mapQuestion)
  },

  async addSurveyQuestion(question: QuestionInsert): Promise<SurveyQuestion> {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert([question])
      .select()
      .single()

    if (error) {
      console.error('設問の追加に失敗しました:', error)
      throw error
    }

    return mapQuestion(data)
  },

  async getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('回答一覧の取得に失敗しました:', error)
      throw error
    }

    return (data ?? []).map(mapResponse)
  },

  async upsertSurveyResponse(response: ResponseUpsert): Promise<SurveyResponse> {
    const { data, error } = await supabase
      .from('survey_responses')
      .upsert( // respondent_id が null の場合はユニーク制約が効かないが、MVPとして許容
        [
          {
            survey_id: response.survey_id,
            respondent_id: response.respondent_id ?? null,
            answers: response.answers,
            submitted_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: 'survey_id,respondent_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('回答の送信に失敗しました:', error)
      throw error
    }

    return mapResponse(data)
  },
}
