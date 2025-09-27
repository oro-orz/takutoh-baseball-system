import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { eventService } from '../services/eventService';

const SupabaseTestPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // 1. Supabase接続テスト
      const { data, error } = await supabase
        .from('events')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        setTestResult(`接続エラー: ${error.message}`);
        return;
      }

      setConnectionStatus('connected');
      setTestResult('Supabase接続成功！');

      // 2. イベントデータの取得テスト
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
      setTestResult(`接続成功！イベント数: ${eventsData.length}件`);

    } catch (error) {
      setConnectionStatus('error');
      setTestResult(`エラー: ${error}`);
    }
  };

  const testCreateEvent = async () => {
    try {
      const testEvent = {
        title: 'Supabaseテストイベント',
        type: 'practice' as const,
        date: new Date().toISOString().split('T')[0],
        location: 'テスト会場',
        eventName: 'Supabaseテスト',
        participants: [],
        clothing: [],
        items: [],
        files: [],
        lunch: 'not_required' as const
      };

      const createdEvent = await eventService.createEvent(testEvent);
      setTestResult(`テストイベント作成成功！ID: ${createdEvent.id}`);
      
      // イベント一覧を再取得
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      setTestResult(`イベント作成エラー: ${error}`);
    }
  };

  const testDeleteEvent = async () => {
    if (events.length === 0) {
      setTestResult('削除するイベントがありません');
      return;
    }

    try {
      const lastEvent = events[events.length - 1];
      await eventService.deleteEvent(lastEvent.id);
      setTestResult(`イベント削除成功！ID: ${lastEvent.id}`);
      
      // イベント一覧を再取得
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      setTestResult(`イベント削除エラー: ${error}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Supabase連携テスト</h2>
      
      {/* 接続ステータス */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">接続ステータス</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm">
            {connectionStatus === 'connected' ? '接続済み' :
             connectionStatus === 'error' ? 'エラー' : '確認中...'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{testResult}</p>
      </div>

      {/* テストボタン */}
      <div className="space-y-2">
        <button
          onClick={testConnection}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          接続テスト
        </button>
        
        <button
          onClick={testCreateEvent}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          テストイベント作成
        </button>
        
        <button
          onClick={testDeleteEvent}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          最後のイベント削除
        </button>
      </div>

      {/* イベント一覧 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">イベント一覧 ({events.length}件)</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium">{event.title}</div>
              <div className="text-gray-600">
                {event.date} - {event.type} - {event.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 環境変数確認 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">環境変数</h3>
        <div className="text-sm space-y-1">
          <div>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '設定済み' : '未設定'}</div>
          <div>SUPABASE_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}</div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTestPage;
