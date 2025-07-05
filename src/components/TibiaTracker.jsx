import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_BASE_URL = 'https://powergamer-backend.up.railway.app/';

const TibiaTracker = () => {
  const [currentRanking, setCurrentRanking] = useState([]);
  const [dailyGains, setDailyGains] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch current ranking
  const fetchCurrentRanking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/current`);
      const data = await response.json();
      setCurrentRanking(data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    }
  };

  // Fetch daily gains
  const fetchDailyGains = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/daily-gains`);
      const data = await response.json();
      setDailyGains(data);
    } catch (error) {
      console.error('Erro ao buscar ganhos diários:', error);
    }
  };

  // Fetch top gainers
  const fetchTopGainers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/top-gainers?days=7`);
      const data = await response.json();
      setTopGainers(data);
    } catch (error) {
      console.error('Erro ao buscar top gainers:', error);
    }
  };

  // Fetch player history
  const fetchPlayerHistory = async (playerName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(playerName)}/history?days=14`);
      const data = await response.json();
      setPlayerHistory(data.reverse()); // Reverse to show chronological order
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  // Manual scrape
  const triggerManualScrape = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/scrape/manual`, { method: 'POST' });
      setTimeout(() => {
        fetchCurrentRanking();
        fetchDailyGains();
        setLastUpdate(new Date());
        setLoading(false);
      }, 5000); // Wait 5 seconds for scraping to complete
    } catch (error) {
      console.error('Erro no scraping manual:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchAllData = () => {
    fetchCurrentRanking();
    fetchDailyGains();
    fetchTopGainers();
    setLastUpdate(new Date());
  };

  fetchAllData(); // Chamada inicial

  const interval = setInterval(() => {
    fetchAllData();
  }, 2 * 60 * 1000); // 5 minutos

  return () => clearInterval(interval); // Limpeza quando o componente desmonta
}, []);

  // Format numbers with dots
  const formatNumber = (num) => {
    return num?.toLocaleString('pt-BR') || '0';
  };

  // Format experience for display
  const formatExp = (exp) => {
    if (exp >= 1000000000) return `${(exp / 1000000000).toFixed(1)}B`;
    if (exp >= 1000000) return `${(exp / 1000000).toFixed(1)}M`;
    if (exp >= 1000) return `${(exp / 1000).toFixed(1)}K`;
    return exp?.toString() || '0';
  };

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const PlayerCard = ({ player, onClick, showGains = false, gainData = null }) => (
    <div
      onClick={() => onClick && onClick(player.name)}
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
              #{player.rank}
            </span>
            <h3 className="font-bold text-lg text-gray-800">{player.name}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Level:</span>
              <span className="ml-2 font-semibold text-green-600">{player.level}</span>
            </div>
            <div>
              <span className="text-gray-600">Exp:</span>
              <span className="ml-2 font-semibold">{formatExp(player.experience)}</span>
            </div>
          </div>
          
          {showGains && gainData && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Exp Hoje:</span>
                  <span className={`ml-2 font-semibold ${gainData.exp_gained_today > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    +{formatExp(gainData.exp_gained_today)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Lvl Hoje:</span>
                  <span className={`ml-2 font-semibold ${gainData.level_gained_today > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    +{gainData.level_gained_today}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {player.vocation || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tibia Tracker</h1>
              <p className="text-gray-600 mt-1">Rexis - Souls of Elysium</p>
            </div>
            
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="text-sm text-gray-500">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <TabButton
              id="ranking"
              label="Ranking Atual"
              active={activeTab === 'ranking'}
              onClick={setActiveTab}
            />
            <TabButton
              id="gains"
              label="Ganhos Diários"
              active={activeTab === 'gains'}
              onClick={setActiveTab}
            />
            <TabButton
              id="top-gainers"
              label="Top Farmers"
              active={activeTab === 'top-gainers'}
              onClick={setActiveTab}
            />
            {selectedPlayer && (
              <TabButton
                id="player-history"
                label={`Histórico - ${selectedPlayer}`}
                active={activeTab === 'player-history'}
                onClick={setActiveTab}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Ranking Tab */}
        {activeTab === 'ranking' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 20 Players</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentRanking.map((player) => (
                <PlayerCard
                  key={player.name}
                  player={player}
                  onClick={(name) => {
                    setSelectedPlayer(name);
                    fetchPlayerHistory(name);
                    setActiveTab('player-history');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daily Gains Tab */}
        {activeTab === 'gains' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ganhos de Hoje</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dailyGains
                .sort((a, b) => b.exp_gained_today - a.exp_gained_today)
                .map((gain) => (
                  <PlayerCard
                    key={gain.name}
                    player={{
                      rank: gain.rank,
                      name: gain.name,
                      level: gain.current_level,
                      experience: gain.current_experience
                    }}
                    showGains={true}
                    gainData={gain}
                    onClick={(name) => {
                      setSelectedPlayer(name);
                      fetchPlayerHistory(name);
                      setActiveTab('player-history');
                    }}
                  />
                ))}
            </div>
            
            {/* Chart */}
            {dailyGains.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top 10 Ganhos de Exp Hoje</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyGains.slice(0, 10).sort((a, b) => b.exp_gained_today - a.exp_gained_today)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis tickFormatter={formatExp} />
                    <Tooltip formatter={(value) => [formatNumber(value), 'Experiência']} />
                    <Bar dataKey="exp_gained_today" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Top Gainers Tab */}
        {activeTab === 'top-gainers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Maiores Farmers (7 dias)</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exp Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Levels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média/Dia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topGainers.map((player, index) => (
                    <tr
                      key={player.name}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedPlayer(player.name);
                        fetchPlayerHistory(player.name);
                        setActiveTab('player-history');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold mr-3">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-900">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatExp(player.total_exp_gained)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +{player.total_levels_gained}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatExp(player.avg_daily_exp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.days_tracked}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Player History Tab */}
        {activeTab === 'player-history' && selectedPlayer && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Histórico - {selectedPlayer}</h2>
              <button
                onClick={() => setActiveTab('ranking')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
            </div>
            
            {/* Player Stats Summary */}
            {playerHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Level Atual</h3>
                  <p className="text-2xl font-bold text-blue-600">{playerHistory[playerHistory.length - 1]?.level}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Experiência Atual</h3>
                  <p className="text-2xl font-bold text-green-600">{formatExp(playerHistory[playerHistory.length - 1]?.experience)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Exp Total (14 dias)</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatExp(playerHistory.reduce((sum, day) => sum + (day.exp_gained || 0), 0))}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Levels Ganhos</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    +{playerHistory.reduce((sum, day) => sum + (day.level_gained || 0), 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Experience Chart */}
            {playerHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Progressão de Experiência</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={playerHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <YAxis tickFormatter={formatExp} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      formatter={(value, name) => [
                        name === 'experience' ? formatNumber(value) : value,
                        name === 'experience' ? 'Experiência' : 'Level'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="experience" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Daily Gains Chart */}
            {playerHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ganhos Diários de Experiência</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playerHistory.filter(day => day.exp_gained > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={formatExp} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      formatter={(value) => [formatNumber(value), 'Exp Ganha']}
                    />
                    <Bar dataKey="exp_gained" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experiência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exp Ganha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Levels Ganhos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {playerHistory.slice().reverse().map((day, index) => (
                    <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {day.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(day.experience)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {day.exp_gained > 0 ? `+${formatExp(day.exp_gained)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                        {day.level_gained > 0 ? `+${day.level_gained}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'ranking' && currentRanking.length === 0) ||
          (activeTab === 'gains' && dailyGains.length === 0) ||
          (activeTab === 'top-gainers' && topGainers.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-500 mb-4">
              Clique em "Atualizar Dados" para fazer o primeiro scraping dos dados do servidor.
            </p>
            <button
              onClick={triggerManualScrape}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Coletando dados...' : 'Coletar Dados'}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Tibia Tracker - Monitoramento automático do ranking de players</p>
            <p className="mt-1">Dados coletados automaticamente todos os dias à meia-noite</p>
          </div>
        </div>
      </footer>
    </div>
  );  
};

export default TibiaTracker;
