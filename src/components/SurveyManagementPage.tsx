import React, { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Loader2, Plus, Calendar, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { surveyService } from '../services/surveyService'
import { Survey, SurveyQuestion, SurveyQuestionType, SurveyResponse } from '../types'
import { handleAsyncError, showSuccess } from '../utils/errorHandler'
import { FileUploadArea, FileList } from './FileUpload'
import { UploadedFile, getFiles } from '../utils/fileUpload'
import { userService } from '../services/userService'

const questionTypeOptions: { value: SurveyQuestionType; label: string }[] = [
  { value: 'single_choice', label: '単一選択' },
  { value: 'multiple_choice', label: '複数選択' },
  { value: 'text', label: '自由記述' },
]

const SurveyManagementPage: React.FC = () => {
  const { authState } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'responses'>('manage')

  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  })

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'text' as SurveyQuestionType,
    optionsText: '',
  })

  useEffect(() => {
    loadSurveys()
    loadUsers()
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

  const loadUsers = async () => {
    await handleAsyncError(async () => {
      const users = await userService.getUsers()
      const map: Record<string, string> = {}
      users.forEach((user) => {
        map[user.id] = user.name
      })
      setUserNameMap(map)
    }, 'ユーザー情報の取得に失敗しました')
  }

  useEffect(() => {
    if (!selectedSurveyId) {
      setQuestions([])
      setResponses([])
      setAttachments([])
      return
    }

    const loadDetails = async () => {
      await handleAsyncError(async () => {
        const [questionList, fileList, responseList] = await Promise.all([
          surveyService.getSurveyQuestions(selectedSurveyId),
          getFiles(undefined, undefined, selectedSurveyId),
          surveyService.getSurveyResponses(selectedSurveyId),
        ])
        setQuestions(questionList)
        setAttachments(fileList)
        setResponses(responseList)
      }, 'アンケート詳細の取得に失敗しました')
    }

    loadDetails()
  }, [selectedSurveyId])

  const handleAttachmentUploaded = (uploaded: UploadedFile) => {
    setAttachments((prev) => [uploaded, ...prev])
    showSuccess('ファイルを添付しました')
  }

  const handleAttachmentDeleted = (fileId: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== fileId))
    showSuccess('ファイルを削除しました')
  }

  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedSurveyId) ?? null,
    [surveys, selectedSurveyId]
  )

  const formatDueDate = (value?: string | null) => {
    if (!value) return '期限なし'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '期限未設定'
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const isSurveyArchived = (survey: Survey) => {
    if (!survey.dueDate) return false
    return new Date(survey.dueDate).getTime() < Date.now()
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'create', label: '作成' },
    { id: 'manage', label: '一覧 / 編集' },
    { id: 'responses', label: '回答' },
  ]

  const SurveyList: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-2">
        <ClipboardCheck className="w-4 h-4 text-primary-600" />
        <h3 className="text-sm font-medium text-gray-900">アンケート一覧</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {isLoading && <div className="p-4 text-center text-sm text-gray-500">読み込み中...</div>}
        {!isLoading && surveys.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">アンケートがありません。</div>
        )}
        {surveys.map((survey) => {
          const isActive = survey.id === selectedSurveyId
          const archived = isSurveyArchived(survey)
          return (
            <button
              key={survey.id}
              onClick={() => setSelectedSurveyId(survey.id)}
              className={`w-full flex flex-col items-start px-4 py-3 text-left transition-colors ${
                isActive ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold text-gray-900">{survey.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    archived ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {archived ? '期限切れ' : '回答受付中'}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 mt-1">
                回答期限: {formatDueDate(survey.dueDate)}
              </span>
              {survey.description && (
                <span className="text-xs text-gray-500 mt-1 line-clamp-2">{survey.description}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  const handleCreateSurvey = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!surveyForm.title.trim()) return

    setIsCreatingSurvey(true)
    const result = await handleAsyncError(async () => {
      const newSurvey = await surveyService.createSurvey({
        title: surveyForm.title.trim(),
        description: surveyForm.description.trim() || undefined,
        created_by: authState.user?.id ?? undefined,
        due_date: surveyForm.dueDate ? new Date(surveyForm.dueDate).toISOString() : null,
      })

      showSuccess('アンケートを作成しました')
      setSurveyForm({ title: '', description: '', dueDate: '' })
      await loadSurveys()
      setSelectedSurveyId(newSurvey.id)
    }, 'アンケートの作成に失敗しました')

    if (result === null) {
      // failed, keep form values for retry
    }

    setIsCreatingSurvey(false)
  }

  const handleAddQuestion = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSurveyId || !questionForm.questionText.trim()) return

    const options = questionForm.optionsText
      .split('\n')
      .map((option) => option.trim())
      .filter((option) => option.length > 0)

    setIsAddingQuestion(true)
    const result = await handleAsyncError(async () => {
      await surveyService.addSurveyQuestion({
        survey_id: selectedSurveyId,
        question_text: questionForm.questionText.trim(),
        question_type: questionForm.questionType,
        options: options.length > 0 ? options : null,
        sort_order: questions.length,
      })

      showSuccess('設問を追加しました')
      setQuestionForm({ questionText: '', questionType: questionForm.questionType, optionsText: '' })
      const updatedQuestions = await surveyService.getSurveyQuestions(selectedSurveyId)
      setQuestions(updatedQuestions)
    }, '設問の追加に失敗しました')

    if (result === null) {
      // failed, keep form values for retry
    }

    setIsAddingQuestion(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-3">
        <ClipboardCheck className="w-5 h-5 text-primary-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">アンケート管理</h2>
          <p className="text-sm text-gray-600">アンケートの作成と設問登録を行います。</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-1">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'create' && (
        <form onSubmit={handleCreateSurvey} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">アンケート作成</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              value={surveyForm.title}
              onChange={(event) => setSurveyForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="例：新しいユニフォームに関するアンケート"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">説明（任意）</label>
            <textarea
              value={surveyForm.description}
              onChange={(event) => setSurveyForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="目的や締切などを記載できます"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">回答期限（任意）</label>
            <input
              type="date"
              value={surveyForm.dueDate}
              onChange={(event) => setSurveyForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500">期限を過ぎたアンケートは回答一覧から自動的に除外されます。</p>
          </div>
          <button
            type="submit"
            disabled={isCreatingSurvey}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              isCreatingSurvey ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isCreatingSurvey ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                作成中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                アンケートを作成
              </>
            )}
          </button>
        </form>
      )}

      {activeTab !== 'create' && (
        <div className="space-y-4">
          <SurveyList />

          <div className="space-y-4">
            {selectedSurvey ? (
              <>
                <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-semibold text-gray-900">{selectedSurvey.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSurveyArchived(selectedSurvey)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {isSurveyArchived(selectedSurvey) ? '期限切れ' : '回答受付中'}
                    </span>
                    <span className="text-xs text-gray-600">
                      回答期限: {formatDueDate(selectedSurvey.dueDate)}
                    </span>
                  </div>
                  {selectedSurvey.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedSurvey.description}</p>
                  )}
                </div>

                {activeTab === 'manage' && (
                  <>
                    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">添付ファイル</h4>
                      <FileUploadArea
                        onFileUploaded={handleAttachmentUploaded}
                        allowedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        maxSize={10}
                        multiple
                        surveyId={selectedSurveyId}
                        uploadedBy={authState.user?.id}
                      />
                      <FileList files={attachments} onFileDeleted={handleAttachmentDeleted} />
                    </div>

                    <form onSubmit={handleAddQuestion} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">設問を追加</h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">設問内容</label>
                        <textarea
                          value={questionForm.questionText}
                          onChange={(event) =>
                            setQuestionForm((prev) => ({ ...prev, questionText: event.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          placeholder="設問の文言を入力してください"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">回答形式</label>
                        <select
                          value={questionForm.questionType}
                          onChange={(event) =>
                            setQuestionForm((prev) => ({
                              ...prev,
                              questionType: event.target.value as SurveyQuestionType,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {questionTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {questionForm.questionType !== 'text' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">選択肢（1行につき1つ）</label>
                          <textarea
                            value={questionForm.optionsText}
                            onChange={(event) =>
                              setQuestionForm((prev) => ({ ...prev, optionsText: event.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                            placeholder="例：\nはい\nいいえ"
                            required
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAddingQuestion}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                          isAddingQuestion ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {isAddingQuestion ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            追加中...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            設問を追加
                          </>
                        )}
                      </button>
                    </form>

                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <h4 className="text-sm font-medium text-gray-900">登録済みの設問</h4>
                      {questions.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-2">まだ設問がありません。</p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {questions.map((question, index) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                              <div className="text-gray-500 mb-1">設問 {index + 1}</div>
                              <div className="text-gray-900 whitespace-pre-wrap">{question.questionText}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                形式:{' '}
                                {question.questionType === 'text'
                                  ? '自由記述'
                                  : question.questionType === 'single_choice'
                                  ? '単一選択'
                                  : '複数選択'}
                              </div>
                              {question.options && question.options.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  選択肢: {question.options.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'responses' && (
                  <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <BarChart3 className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">回答一覧</span>
                    </div>
                    {responses.length === 0 ? (
                      <p className="text-sm text-gray-500">まだ回答はありません。</p>
                    ) : (
                      <div className="space-y-4">
                        {responses.map((response) => (
                          <div key={response.id} className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50">
                            <div className="text-gray-500 mb-2 text-sm">
                              <span className="font-medium text-gray-700">
                                {response.respondentId
                                  ? userNameMap[response.respondentId] ?? response.respondentId
                                  : '匿名'}
                              </span>
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-sm text-gray-500">
                アンケートを選択してください。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyManagementPage
