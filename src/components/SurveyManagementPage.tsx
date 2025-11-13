import React, { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Loader2, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { surveyService } from '../services/surveyService'
import { Survey, SurveyQuestion, SurveyQuestionType } from '../types'
import { handleAsyncError, showSuccess } from '../utils/errorHandler'

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
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
  })

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'text' as SurveyQuestionType,
    optionsText: '',
  })

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
    if (!selectedSurveyId) {
      setQuestions([])
      return
    }

    const loadQuestions = async () => {
      await handleAsyncError(async () => {
        const data = await surveyService.getSurveyQuestions(selectedSurveyId)
        setQuestions(data)
      }, '設問の取得に失敗しました')
    }

    loadQuestions()
  }, [selectedSurveyId])

  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedSurveyId) ?? null,
    [surveys, selectedSurveyId]
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
      })

      showSuccess('アンケートを作成しました')
      setSurveyForm({ title: '', description: '' })
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

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">アンケート一覧</h3>
            <p className="text-xs text-gray-500">編集したいアンケートを選択してください。</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading && <div className="p-4 text-center text-sm text-gray-500">読み込み中...</div>}
          {!isLoading && surveys.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">まだアンケートがありません。</div>
          )}
          {surveys.map((survey) => (
            <button
              key={survey.id}
              className={`w-full flex flex-col items-start px-4 py-3 text-left transition-colors ${
                survey.id === selectedSurveyId ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedSurveyId(survey.id)}
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
            <h3 className="text-sm font-medium text-gray-900">選択中のアンケート</h3>
            <p className="text-md font-semibold text-gray-900 mt-1">{selectedSurvey.title}</p>
            {selectedSurvey.description && (
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{selectedSurvey.description}</p>
            )}
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
                  placeholder="例：
はい
いいえ"
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
                      形式: {
                        question.questionType === 'text'
                          ? '自由記述'
                          : question.questionType === 'single_choice'
                          ? '単一選択'
                          : '複数選択'
                      }
                    </div>
                    {question.options && question.options.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        選択肢: {question.options.join(', ')}
                      </div>
                    )}
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

export default SurveyManagementPage
