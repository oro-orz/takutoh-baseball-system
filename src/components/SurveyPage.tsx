import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, ChevronDown, ClipboardCheck, X, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Survey, SurveyQuestion, SurveyResponse, SurveyAnswerValue } from '../types'
import { surveyService } from '../services/surveyService'
import { handleAsyncError, showSuccess } from '../utils/errorHandler'
import { userService } from '../services/userService'
import { UploadedFile, getFiles } from '../utils/fileUpload'

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
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null)

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

        const files = await getFiles(undefined, undefined, selectedSurveyId)
        setAttachments(files)

        // 自分の既存回答があればフォームに反映
        const myResponse = loadedResponses.find(
          (response) => response.respondentId === authState.user?.id
        )
        setFormState(myResponse?.answers ?? {})
        setEditingResponseId(null)
      }, 'アンケート詳細の取得に失敗しました')
    }

    loadDetail()
  }, [selectedSurveyId, authState.user?.id])

  const handleSelectSurvey = (surveyId: string) => {
    setSelectedSurveyId(surveyId)
    setFormState({})
    setShowResponses(false)
    setAttachments([])
  setEditingResponseId(null)
    const targetSurvey = surveys.find((survey) => survey.id === surveyId)
    if (targetSurvey && isSurveyArchived(targetSurvey)) {
      setShowArchive(true)
    } else {
      setShowArchive(false)
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
    const wasEditing = editingResponseId !== null || !!myResponse

    setIsSubmitting(true)
    const result = await handleAsyncError(async () => {
      await surveyService.upsertSurveyResponse({
        survey_id: selectedSurveyId,
        respondent_id: authState.user?.id ?? null,
        answers: formState,
      })

      const updatedResponses = await surveyService.getSurveyResponses(selectedSurveyId)
      setResponses(updatedResponses)
      const latestMyResponse = updatedResponses.find(
        (response) => response.respondentId === authState.user?.id
      )
      setEditingResponseId(null)
      setFormState(latestMyResponse?.answers ?? {})
      showSuccess(wasEditing ? '回答を更新しました' : '回答を送信しました')
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

const myResponse = useMemo(
  () => responses.find((response) => response.respondentId === authState.user?.id) ?? null,
  [responses, authState.user?.id]
)
const isEditing = editingResponseId !== null

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

const handleEditResponse = (response: SurveyResponse) => {
  if (response.respondentId !== authState.user?.id) return
  setFormState(response.answers)
  setEditingResponseId(response.id)
  setShowResponses(false)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleCancelEdit = () => {
  if (myResponse) {
    setFormState(myResponse.answers)
  } else {
    setFormState({})
  }
  setEditingResponseId(null)
}

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
            <div className="space-y-3">
              {selectedSurvey.dueDate && (
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                    isSurveyArchived(selectedSurvey)
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <span>回答期限</span>
                  <span className="font-semibold">{formatDueDate(selectedSurvey.dueDate)}</span>
                </div>
              )}
              <h3 className="text-base font-semibold text-gray-900">{selectedSurvey.title}</h3>
              <div className="flex items-center space-x-2 text-xs">
                {isSurveyArchived(selectedSurvey) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-medium">
                    アーカイブ
                  </span>
                )}
              </div>
              {selectedSurvey.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedSurvey.description}</p>
              )}
            </div>

            {attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">添付ファイル</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((file) => {
                    if (file.type.startsWith('image/')) {
                      return (
                        <button
                          type="button"
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="group rounded-lg border border-gray-200 overflow-hidden bg-white hover:border-primary-400 transition-colors"
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-36 object-cover"
                          />
                          <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-200 text-left group-hover:text-primary-600">
                            {file.name}
                          </div>
                        </button>
                      )
                    }

                    if (file.type === 'application/pdf') {
                      return (
                        <button
                          type="button"
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary-400 transition-colors text-left"
                        >
                          <span className="flex items-center space-x-2 text-sm text-gray-700">
                            <FileText className="w-4 h-4 text-primary-600" />
                            <span>{file.name}</span>
                          </span>
                          <span className="text-xs text-primary-600">プレビュー</span>
                        </button>
                      )
                    }

                    return (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary-400 transition-colors"
                      >
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-primary-600">ファイルを開く</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">回答フォーム</h4>
              {isEditing && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {myResponse
                        ? '保存済みの回答を編集中です。変更しない場合は「編集しない」を押してください。'
                        : '回答を編集中です。変更しない場合は「編集しない」を押してください。'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center justify-center px-3 py-1 rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50 font-medium"
                    >
                      編集しない
                    </button>
                  </div>
                </div>
              )}

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
                ) : isEditing ? (
                  '回答を更新'
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
                    <div className="text-gray-500 mb-2 text-sm">
                      <span className="font-medium text-gray-700">{response.respondentId ? userNameMap[response.respondentId] ?? '名前不明' : '匿名'}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(response.submittedAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
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
                    {response.respondentId === authState.user?.id && (
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => handleEditResponse(response)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          回答を編集
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AccordionSection>
        </div>
      )}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="px-5 pt-5 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{previewFile.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(previewFile.uploadedAt).toLocaleString('ja-JP')}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 overflow-auto">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-full max-w-full object-contain rounded-lg shadow"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded-lg border border-gray-200"
                />
              ) : (
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 underline"
                >
                  ファイルを開く
                </a>
              )}
            </div>
          </div>
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
