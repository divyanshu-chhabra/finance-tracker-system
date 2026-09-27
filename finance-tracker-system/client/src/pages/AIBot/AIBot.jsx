import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import './AIBot.css';

const AIBot = () => {
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadAnalysis(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAnalysis = async () => {
    try {
      const data = await aiAPI.analyze();
      setAnalysis(data);
      // Welcome message
      setMessages([{
        type: 'bot',
        text: `Hello! 👋 I've analyzed your financial profile. Your financial health score is **${data.healthScore}/100** (Grade: ${data.grade}). Feel free to ask me about your savings, investments, loans, expenses, or any financial advice!`
      }]);
    } catch (err) {
      setMessages([{
        type: 'bot',
        text: 'Hello! 👋 I\'m your AI financial advisor. Add some financial data (assets, expenses, loans) and I\'ll analyze your financial health and provide personalized advice!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await aiAPI.chat(userMsg);
      setMessages(prev => [...prev, { type: 'bot', text: response.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'What is my net worth?',
    'How are my savings?',
    'Tell me about my investments',
    'How much debt do I have?',
    'Analyze my spending',
    'Give me a budget plan'
  ];

  const healthColor = analysis?.healthScore >= 70 ? '#22c55e' 
    : analysis?.healthScore >= 40 ? '#f59e0b' 
    : '#f43f5e';

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="auth-spinner" style={{ width: 40, height: 40 }}></div>
          <p>AI is analyzing your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ai-page">
      <div className="page-header">
        <h1 className="page-title">AI Finance Advisor 🤖</h1>
        <p className="page-subtitle">Get personalized financial insights and recommendations</p>
      </div>

      <div className="ai-layout">
        {/* Analysis Panel */}
        <div className="ai-analysis-panel">
          {/* Health Score */}
          {analysis && (
            <div className="ai-score-card card-glass">
              <h3 className="ai-score-title">Financial Health</h3>
              <div className="ai-score-circle" style={{ '--score': analysis.healthScore, '--color': healthColor }}>
                <div className="ai-score-inner">
                  <span className="ai-score-value">{analysis.healthScore}</span>
                  <span className="ai-score-grade">Grade: {analysis.grade}</span>
                </div>
              </div>

              <div className="ai-score-metrics">
                <div className="ai-metric">
                  <span className="ai-metric-icon">💰</span>
                  <div>
                    <div className="ai-metric-label">Net Worth</div>
                    <div className="ai-metric-value">{formatCurrency(analysis.netWorth)}</div>
                  </div>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-icon">📊</span>
                  <div>
                    <div className="ai-metric-label">Savings Rate</div>
                    <div className="ai-metric-value">{analysis.savingsRate}%</div>
                  </div>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-icon">🏦</span>
                  <div>
                    <div className="ai-metric-label">Debt-to-Income</div>
                    <div className="ai-metric-value">{analysis.dtiRatio}%</div>
                  </div>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-icon">🛡️</span>
                  <div>
                    <div className="ai-metric-label">Emergency Fund</div>
                    <div className="ai-metric-value">{analysis.emergencyMonths} months</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {analysis?.feedback && (
            <div className="ai-feedback-card card">
              <h3 className="ai-feedback-title">Key Insights</h3>
              {analysis.feedback.map((item, i) => (
                <div key={i} className={`ai-feedback-item ${item.type}`}>
                  <span className="ai-feedback-icon">
                    {item.type === 'positive' ? '✅' : item.type === 'warning' ? '⚠️' : item.type === 'danger' ? '🚨' : 'ℹ️'}
                  </span>
                  <span>{item.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {analysis?.tips?.length > 0 && (
            <div className="ai-tips-card card">
              <h3 className="ai-feedback-title">💡 Action Items</h3>
              {analysis.tips.map((tip, i) => (
                <div key={i} className="ai-tip-item">
                  <span className="ai-tip-number">{i + 1}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="ai-chat-panel">
          <div className="ai-chat-container card">
            <div className="ai-chat-header">
              <div className="ai-chat-bot-info">
                <div className="ai-chat-avatar">🤖</div>
                <div>
                  <h3 className="ai-chat-name">FinanceMore AI</h3>
                  <span className="ai-chat-status">● Online</span>
                </div>
              </div>
            </div>

            <div className="ai-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-chat-message ${msg.type}`}>
                  {msg.type === 'bot' && <span className="ai-msg-avatar">🤖</span>}
                  <div className={`ai-msg-bubble ${msg.type}`}>
                    {msg.text}
                  </div>
                  {msg.type === 'user' && <span className="ai-msg-avatar user">You</span>}
                </div>
              ))}
              {chatLoading && (
                <div className="ai-chat-message bot">
                  <span className="ai-msg-avatar">🤖</span>
                  <div className="ai-msg-bubble bot">
                    <div className="ai-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="ai-quick-questions">
              {quickQuestions.map((q, i) => (
                <button key={i} className="ai-quick-btn" onClick={() => { setInput(q); }}>
                  {q}
                </button>
              ))}
            </div>

            <div className="ai-chat-input">
              <input
                type="text"
                className="form-input"
                placeholder="Ask me anything about your finances..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="btn btn-primary ai-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || chatLoading}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBot;
