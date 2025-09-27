import React, { useState } from 'react';
import { participantService } from '../services/participantService';
import { participationService } from '../services/participationService';
import { eventService } from '../services/eventService';
import { gameRecordService } from '../services/gameRecordService';

const SupabaseTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');

  const testParticipant = async () => {
    try {
      const newParticipant = await participantService.createParticipant({
        name: 'テスト選手',
        role: 'player',
        parent_name: 'テスト保護者',
        parent_email: 'test@example.com',
        parent_phone: '090-1234-5678'
      });
      setTestResult(`参加者作成成功！ID: ${newParticipant.id}`);
    } catch (error: any) {
      console.error('参加者作成エラー:', error);
      setTestResult(`参加者作成エラー: ${error?.message || JSON.stringify(error, null, 2)}`);
    }
  };

  const testParticipation = async () => {
    try {
      // まずイベントを取得
      const events = await eventService.getEvents();
      if (events.length === 0) {
        setTestResult('イベントがありません。まずイベントを作成してください。');
        return;
      }

      // 参加者を取得
      const participants = await participantService.getParticipants();
      if (participants.length === 0) {
        setTestResult('参加者がありません。まず参加者を作成してください。');
        return;
      }

      const newParticipation = await participationService.upsertParticipation({
        event_id: events[0].id,
        participant_id: participants[0].id,
        status: 'attending'
      });
      setTestResult(`参加状況作成成功！ID: ${newParticipation.id}`);
    } catch (error: any) {
      console.error('参加状況作成エラー:', error);
      setTestResult(`参加状況作成エラー: ${error?.message || JSON.stringify(error, null, 2)}`);
    }
  };

  const testGameRecord = async () => {
    try {
      // まずイベントを取得
      const events = await eventService.getEvents();
      if (events.length === 0) {
        setTestResult('イベントがありません。まずイベントを作成してください。');
        return;
      }

      const newGameRecord = await gameRecordService.createGameRecord({
        event_id: events[0].id,
        opponent: 'テストチーム',
        our_score: 5,
        opponent_score: 3,
        details: 'テスト試合記録'
      });
      setTestResult(`試合記録作成成功！ID: ${newGameRecord.id}`);
    } catch (error: any) {
      console.error('試合記録作成エラー:', error);
      setTestResult(`試合記録作成エラー: ${error?.message || JSON.stringify(error, null, 2)}`);
    }
  };

  const testGetData = async () => {
    try {
      const events = await eventService.getEvents();
      const participants = await participantService.getParticipants();
      
      let participations = [];
      let gameRecords = [];
      if (events.length > 0) {
        participations = await participationService.getParticipationsByEvent(events[0].id);
        gameRecords = await gameRecordService.getGameRecordsByEvent(events[0].id);
      }

      setTestResult(`データ取得成功！
イベント: ${events.length}件
参加者: ${participants.length}件
参加状況: ${participations.length}件
試合記録: ${gameRecords.length}件`);
    } catch (error: any) {
      console.error('データ取得エラー:', error);
      setTestResult(`データ取得エラー: ${error?.message || JSON.stringify(error, null, 2)}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Supabase連携テスト</h2>
      
      <div className="space-y-2">
        <button
          onClick={testParticipant}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          テスト参加者作成
        </button>
        
        <button
          onClick={testParticipation}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          テスト参加状況作成
        </button>
        
        <button
          onClick={testGameRecord}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          テスト試合記録作成
        </button>
        
        <button
          onClick={testGetData}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          データ取得テスト
        </button>
      </div>

      {testResult && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">テスト結果:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseTestPage;
