import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, ChevronDown, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Survey, SurveyQuestion, SurveyResponse, SurveyAnswerValue } from '../types'
import { surveyService } from '../services/surveyService'
import { handleAsyncError, showSuccess } from '../utils/errorHandler'
import { userService } from '../services/userService'

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
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({})
  const [showArchive, setShowArchive] = useState(false)
  const [showResponses, setShowResponses] = useState(false)

  const isSurveyArchived = (survey: Survey) => {
    if (!survey.dueDate) return false
    const due = new Date(survey.dueDate)
    const now = new Date()
    return due.getTime() < now.getTime()
  }

  const formatDueDate = (value?: string) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  useEffect(() => {
    loadSurveys()
    loadUsers()
  }, [])

  useEffect(() => {
    if (authState.user) {
      setUserNameMap((prev) => ({ ...prev, [authState.user!.id]: authState.user!.name }))
    }
  }, [authState.user?.id, authState.user?.name])

  const loadSurveys = async () => {
    await handleAsyncError(async () => {
      setIsLoading(true)
      const data = await surveyService.getSurveys()
      const active = data.filter((survey) => !isSurveyArchived(survey))
      const archived = data.filter((survey) => isSurveyArchived(survey))
      setSurveys(data)
      setSelectedSurveyId((prev) => {
        if (prev && data.some((survey) => survey.id === prev)) {
          return prev
        }
        const defaultSurvey = active[0] ?? archived[0]
        if (defaultSurvey && isSurveyArchived(defaultSurvey)) {
          setShowArchive(true)
        }
        return defaultSurvey ? defaultSurvey.id : ''
      })
      if (active.length > 0) {
        setShowArchive(false)
      }
    }, 'アンケート一覧の取得に失敗しました')
    setIsLoading(false)
  }

  const loadUsers = async () => {
    await handleAsyncError(async () => {
      const users = await userService.getUsers()
      const map: Record<string, string> = {}
      users.forEach((user) => {
        map[user.id] = user.name
      })
      if (authState.user) {
        map[authState.user.id] = authState.user.name
      }
      setUserNameMap(map)
    }, 'ユーザー情報の取得に失敗しました')
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
    setShowResponses(false)
    const targetSurvey = surveys.find((survey) => survey.id === surveyId)
    if (targetSurvey && isSurveyArchived(targetSurvey)) {
      setShowArchive(true)
    }
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

  const { activeSurveys, archivedSurveys } = useMemo(() => {
    const active: Survey[] = []
    const archived: Survey[] = []
    surveys.forEach((survey) => {
      if (isSurveyArchived(survey)) {
        archived.push(survey)
      } else {
        active.push(survey)
      }
    })
    return { activeSurveys: active, archivedSurveys: archived }
  }, [surveys])

  const hasQuestions = questions.length > 0

  return (
    <div className="space-y-5">
      <h2 className="text-md font-semibold text-gray-900">アンケート</h2>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {isLoading && (
          <div className="p-4 text-center text-gray-500 text-sm">読み込み中...</div>
        )}
        {!isLoading && activeSurveys.length === 0 && archivedSurveys.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">公開中のアンケートはありません。</div>
        )}
        {activeSurveys.map((survey) => {
          const isActive = survey.id === selectedSurveyId
          return (
            <button
              key={survey.id}
              onClick={() => handleSelectSurvey(survey.id)}
              className={`w-full flex items-start space-x-3 px-4 py-3 text-left transition-all ${
                isActive ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`mt-0.5 rounded-md p-2 ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{survey.title}</div>
                {survey.dueDate && (
                  <div className="text-[11px] text-primary-600 mt-1">期限: {formatDueDate(survey.dueDate)}</div>
                )}
                {survey.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{survey.description}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {!isLoading && activeSurveys.length === 0 && archivedSurveys.length > 0 && (
        <div className="text-xs text-gray-500 px-1">期限切れになったアンケートは下のアーカイブから確認できます。</div>
      )}

      {archivedSurveys.length > 0 && (
        <AccordionSection
          title={`アーカイブ (${archivedSurveys.length})`}
          isOpen={showArchive}
          onToggle={() => setShowArchive((prev) => !prev)}
        >
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
            {archivedSurveys.map((survey) => {
              const isActive = survey.id === selectedSurveyId
              return (
                <button
                  key={survey.id}
                  onClick={() => handleSelectSurvey(survey.id)}
                  className={`w-full flex items-start space-x-3 px-4 py-3 text-left transition-all ${
                    isActive ? 'bg-gray-100 border-l-4 border-gray-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="mt-0.5 rounded-md p-2 bg-gray-200 text-gray-600">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{survey.title}</div>
                    <div className="text-[11px] text-gray-500 mt-1">期限: {formatDueDate(survey.dueDate)}</div>
                    {survey.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{survey.description}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </AccordionSection>
      )}

      {selectedSurvey && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{selectedSurvey.title}</h3>
              <div className="flex items-center space-x-2 text-xs">
                {selectedSurvey.dueDate && (
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold ${
                    isSurveyArchived(selectedSurvey)
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    <span>期限:</span>
                    <span>{formatDueDate(selectedSurvey.dueDate)}</span>
                  </span>
                )}
                {isSurveyArchived(selectedSurvey) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-medium">
                    アーカイブ
                  </span>
                )}
              </div>
              {selectedSurvey.dueDate && !isSurveyArchived(selectedSurvey) && (
                <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  期限内に送信してください。
                </p>
              )}
              {selectedSurvey.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedSurvey.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">回答フォーム</h4>

              <div className="space-y-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
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
              </div>

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
          </div>

          <AccordionSection
            title="回答一覧"
            isOpen={showResponses}
            onToggle={() => setShowResponses((prev) => !prev)}
          >
            {responses.length === 0 ? (
              <p className="text-sm text-gray-500">まだ回答はありません。</p>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50">
                    <div className="text-gray-500 mb-2">
                      回答者: {response.respondentId ? userNameMap[response.respondentId] ?? '名前不明' : '匿名'} / {new Date(response.submittedAt).toLocaleString('ja-JP')}
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
          </AccordionSection>
        </div>
      )}
    </div>
  )
}

interface AccordionSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

export default SurveyPage
