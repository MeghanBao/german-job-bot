import { useState, useEffect } from 'react';
import { MessageCircle, Briefcase, FileText, Settings, Bot, AlertCircle, CheckCircle, Clock, Trash2, Send, ChevronRight, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PendingQuestion {
  id: string;
  runId: string;
  jobId: string;
  platform: string;
  fieldName: string;
  normalizedKey: string;
  riskLevel: string;
  screenshot?: string;
  suggestedAnswer?: string;
  status: string;
  createdAt: string;
}

interface Answer {
  id: string;
  normalizedKey: string;
  value: string;
  text: string;
  label: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'jobs' | 'resume' | 'questions' | 'settings'>('chat');
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<PendingQuestion | null>(null);
  
  // ... existing code ...
  
  useEffect(() => {
    fetchPendingQuestions();
    fetchAnswers();
  }, []);

  const fetchPendingQuestions = async () => {
    try {
      const res = await fetch('/api/pending-questions');
      const data = await res.json();
      setPendingQuestions(data);
    } catch (e) { console.error(e); }
  };

  const fetchAnswers = async () => {
    try {
      const res = await fetch('/api/answers');
      const data = await res.json();
      const allAnswers: Answer[] = [];
      data.fields?.forEach((field: any) => {
        field.answers?.forEach((ans: Answer) => {
          allAnswers.push(ans);
        });
      });
      setAnswers(allAnswers);
    } catch (e) { console.error(e); }
  };

  const resolveQuestion = async (questionId: string, answer: string) => {
    try {
      await fetch(`/api/pending-questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolvedAnswer: answer })
      });
      fetchPendingQuestions();
      setSelectedQuestion(null);
    } catch (e) { console.error(e); }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low': return <ShieldCheck className="w-4 h-4 text-green-400" />;
      default: return <Shield className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-900/30 border-red-800';
      case 'medium': return 'bg-yellow-900/30 border-yellow-800';
      case 'low': return 'bg-green-900/30 border-green-800';
      default: return 'bg-zinc-800';
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            German Job Bot
          </h1>
          <p className="text-xs text-zinc-500 mt-1">🇩🇪 AI Job Assistant</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeTab === 'jobs' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <Briefcase className="w-4 h-4" />
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeTab === 'resume' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <FileText className="w-4 h-4" />
            Resume
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeTab === 'questions' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <AlertCircle className="w-4 h-4" />
            Questions
            {pendingQuestions.filter(q => q.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingQuestions.filter(q => q.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online • Ready
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Questions View */}
        {activeTab === 'questions' && (
          <div className="flex-1 flex">
            {/* Questions List */}
            <div className="w-1/3 border-r border-zinc-800 overflow-y-auto">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="font-semibold">Pending Questions</h2>
                <p className="text-sm text-zinc-500">
                  {pendingQuestions.filter(q => q.status === 'pending').length} pending
                </p>
              </div>
              <div className="p-2">
                {pendingQuestions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No pending questions!</p>
                    <p className="text-sm">All jobs are running smoothly.</p>
                  </div>
                ) : (
                  pendingQuestions.map(q => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full text-left p-3 rounded-lg mb-2 ${getRiskColor(q.riskLevel)} ${selectedQuestion?.id === q.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getRiskIcon(q.riskLevel)}
                        <span className="text-sm font-medium">{q.fieldName}</span>
                      </div>
                      <div className="text-xs text-zinc-400">{q.platform}</div>
                      <div className="text-xs text-zinc-500 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(q.createdAt).toLocaleTimeString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Question Detail */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedQuestion ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {getRiskIcon(selectedQuestion.riskLevel)}
                    <h3 className="text-xl font-semibold">{selectedQuestion.fieldName}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${selectedQuestion.riskLevel === 'high' ? 'bg-red-500' : selectedQuestion.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-black`}>
                      {selectedQuestion.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Platform<p className="font-medium">{selectedQuestion.platform}</p>
                    </p>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Normalized Key</p>
                    <p className="font-mono text-sm">{selectedQuestion.normalizedKey}</p>
                  </div>

                  {selectedQuestion.suggestedAnswer && (
                    <div className="bg-zinc-900 rounded-xl p-4 mb-4 border border-blue-800">
                      <p className="text-sm text-zinc-400 mb-2">Suggested Answer</p>
                      <p className="text-blue-400">{selectedQuestion.suggestedAnswer}</p>
                    </div>
                  )}

                  {/* Answer Library */}
                  <div className="mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Choose from Answer Library</p>
                    <div className="space-y-2">
                      {answers
                        .filter(a => a.normalizedKey === selectedQuestion.normalizedKey)
                        .map(answer => (
                          <button
                            key={answer.id}
                            onClick={() => resolveQuestion(selectedQuestion.id, answer.text)}
                            className="w-full text-left bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg"
                          >
                            <p className="font-medium">{answer.label}</p>
                            <p className="text-sm text-zinc-400">{answer.text}</p>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Custom Answer */}
                  <div className="mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Or enter custom answer</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg"
                        id="customAnswer"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('customAnswer') as HTMLInputElement;
                          if (input.value) resolveQuestion(selectedQuestion.id, input.value);
                        }}
                        className="bg-blue-600 px-4 py-2 rounded-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => resolveQuestion(selectedQuestion.id, '')}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg"
                  >
                    Skip this question
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  Select a question to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs remain the same... */}
      </main>
    </div>
  );
}

export default App;
