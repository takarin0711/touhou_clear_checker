import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [games, setGames] = useState([]);
  const [clearStatus, setClearStatus] = useState([]);

  useEffect(() => {
    fetchGames();
    fetchClearStatus();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games');
      setGames(response.data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchClearStatus = async () => {
    try {
      const response = await axios.get('/api/clear-status');
      setClearStatus(response.data.clear_status);
    } catch (error) {
      console.error('Error fetching clear status:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>東方クリアチェッカー</h1>
        <p>東方プロジェクトのクリア状況を管理しましょう</p>
      </header>
      <main>
        <section>
          <h2>ゲーム一覧</h2>
          {games.length === 0 ? (
            <p>ゲームデータを読み込み中...</p>
          ) : (
            <ul>
              {games.map((game, index) => (
                <li key={index}>{game}</li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2>クリア状況</h2>
          {clearStatus.length === 0 ? (
            <p>クリア状況を読み込み中...</p>
          ) : (
            <ul>
              {clearStatus.map((status, index) => (
                <li key={index}>{status}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;