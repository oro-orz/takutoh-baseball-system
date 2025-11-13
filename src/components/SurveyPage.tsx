import React, { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Survey, SurveyQuestion, SurveyResponse, SurveyAnswerValue } from '../types'
import { surveyService } from '../services/surveyService'
import { handleAsyncError, showSuccess } from '../utils/errorHandler'

interface FormState {
  [questionId: string]: SurveyAnswerValue
}

const SurveyPage: React.FC = () => {
  const { authState } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [formState, setFormState] = useState<FormState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    await handleAsyncError(async () => {
      setIsLoading(true)
      const data = await surveyService.getSurveys()
      setSurveys(data)
      if (data.length > 0) {
        setSelectedSurveyId((prev) => prev || data[0].id)
      }
    }, 'アンケート一覧の取得に失敗しました')
    setIsLoading(false)
  }

  useEffect(() => {
    if (!selectedSurveyId) return

    const loadDetail = async () => {
      await handleAsyncError(async () => {
        const [loadedQuestions, loadedResponses] = await Promise.all([
          surveyService.getSurveyQuestions(selectedSurveyId),
          surveyService.getSurveyResponses(selectedSurveyId),
        ])
        setQuestions(loadedQuestions)
        setResponses(loadedResponses)

        // 自分の既存回答があればフォームに反映
        const myResponse = loadedResponses.find(
          (response) => response.respondentId === authState.user?.id
        )
        setFormState(myResponse?.answers ?? {})
      }, 'アンケート詳細の取得に失敗しました')
    }

    loadDetail()
  }, [selectedSurveyId, authState.user?.id])

  const handleSelectSurvey = (surveyId: string) => {
    setSelectedSurveyId(surveyId)
    setFormState({})
  }

  const handleInputChange = (question: SurveyQuestion, value: SurveyAnswerValue) => {
    setFormState((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSurveyId) return

    setIsSubmitting(true)
    const result = await handleAsyncError(async () => {
      await surveyService.upsertSurveyResponse({
        survey_id: selectedSurveyId,
        respondent_id: authState.user?.id ?? null,
        answers: formState,
      })

      showSuccess('回答を送信しました')
      const updatedResponses = await surveyService.getSurveyResponses(selectedSurveyId)
      setResponses(updatedResponses)
    }, '回答の送信に失敗しました')

    if (result !== null) {
      // Nothing special, formState already reflects latest answers
    }

    setIsSubmitting(false)
  }

  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedSurveyId) ?? null,
    [surveys, selectedSurveyId]
  )

  const hasQuestions = questions.length > 0

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-3">
        <ClipboardList className="w-5 h-5 text-primary-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">アンケート</h2>
          <p className="text-sm text-gray-600">公開中のアンケートから選択して回答してください。</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">アンケート一覧</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">読み込み中...</div>
          )}
          {!isLoading && surveys.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">公開中のアンケートはありません。</div>
          )}
          {surveys.map((survey) => (
            <button
              key={survey.id}
              className={`w-full flex flex-col items-start px-4 py-3 text-left transition-colors ${
                survey.id === selectedSurveyId ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectSurvey(survey.id)}
            >
              <span className="text-sm font-medium text-gray-900">{survey.title}</span>
              {survey.description && (
                <span className="text-xs text-gray-600 mt-1">{survey.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedSurvey && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-md font-semibold text-gray-900">{selectedSurvey.title}</h3>
            {selectedSurvey.description && (
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                {selectedSurvey.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">回答フォーム</h4>

            {!hasQuestions && (
              <p className="text-sm text-gray-500">
                このアンケートにはまだ設問が登録されていません。
              </p>
            )}

            {questions.map((question, index) => {
              const value = formState[question.id]
              return (
                <div key={question.id} className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {question.questionText}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {question.questionType === 'text'
                        ? '自由記述'
                        : question.questionType === 'single_choice'
                        ? '単一選択'
                        : '複数選択'}
                    </span>
                  </div>

                  {question.questionType === 'text' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      value={(value as string) ?? ''}
                      onChange={(event) => handleInputChange(question, event.target.value)}
                    />
                  )}

                  {question.questionType === 'single_choice' && (
                    <div className="space-y-2">
                      {(question.options ?? []).map((option) => (
                        <label key={option} className="flex items-center space-x-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={value === option}
                            onChange={() => handleInputChange(question, option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.questionType === 'multiple_choice' && (
                    <div className="space-y-2">
                      {(question.options ?? []).map((option) => {
                        const selectedValues = Array.isArray(value) ? value : []
                        const isSelected = selectedValues.includes(option)
                        return (
                          <label key={option} className="flex items-center space-x-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              value={option}
                              checked={isSelected}
                              onChange={(event) => {
                                const nextValues = new Set(selectedValues)
                                if (event.target.checked) {
                                  nextValues.add(option)
                                } else {
                                  nextValues.delete(option)
                                }
                                handleInputChange(question, Array.from(nextValues))
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <button
              type="submit"
              disabled={isSubmitting || !hasQuestions}
              className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                isSubmitting || !hasQuestions
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  送信中...
                </>
              ) : (
                '回答を送信'
              )}
            </button>
          </form>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">回答一覧</h4>
            {responses.length === 0 ? (
              <p className="text-sm text-gray-500">まだ回答はありません。</p>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="text-gray-500 mb-2">
                      回答者: {response.respondentId ?? '不明'} / {new Date(response.submittedAt).toLocaleString('ja-JP')}
                    </div>
                    <div className="space-y-2">
                      {questions.map((question) => {
                        const answer = response.answers[question.id]
                        let displayAnswer = ''
                        if (Array.isArray(answer)) {
                          displayAnswer = answer.join(', ')
                        } else if (answer === null || answer === undefined || answer === '') {
                          displayAnswer = '-'
                        } else {
                          displayAnswer = String(answer)
                        }
                        return (
                          <div key={question.id}>
                            <div className="text-gray-600">{question.questionText}</div>
                            <div className="text-gray-900 mt-0.5 whitespace-pre-wrap">{displayAnswer}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyPage
