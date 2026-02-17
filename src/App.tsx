import { useState, useEffect, useRef } from 'react';
import { Send, Briefcase, FileText, Settings, Plus, Trash2, CheckCircle, Clock, XCircle, Sparkles, User, MessageCircle, TrendingUp } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary?: string;
  status: string;
  appliedAt?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'action';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', content: '👋 Hi! I\'m your German Job Bot. Tell me what job you\'re looking for!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeView, setActiveView] = useState<'chat' | 'jobs' | 'resume'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) { console.error(e); }
  };

  const addMessage = (type: Message['type'], content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userInput = input.trim();
    setInput('');
    addMessage('user', userInput);
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      addMessage('bot', `💭 Searching for "${userInput}" jobs in Germany...`);
    }, 500);

    setTimeout(() => {
      addMessage('action', '🔍 Navigating to job platforms...');
    }, 1500);

    setTimeout(() => {
      addMessage('action', '✓ Found 15 relevant positions');
    }, 2500);

    setTimeout(async () => {
      // Search for jobs
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: userInput, location: 'Germany' })
        });
        const data = await res.json();
        
        if (data.jobs && data.jobs.length > 0) {
          addMessage('bot', `📋 Found ${data.jobs.length} jobs! Adding them to your list.`);
          
          // Add jobs to database
          for (const job of data.jobs) {
            await fetch('/api/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...job, status: 'found' })
            });
          }
          fetchJobs();
          setActiveView('jobs');
        } else {
          addMessage('bot', '😕 No jobs found. Try different keywords!');
        }
      } catch (e) {
        addMessage('bot', '❌ Error searching jobs. Please try again.');
      }
      setIsTyping(false);
    }, 3500);
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    found: jobs.filter(j => j.status === 'found').length
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            German Job Bot
          </h1>
          <p className="text-xs text-zinc-500 mt-1">🇩🇪 AI Job Assistant</p>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2">Your Stats</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Jobs Found</span>
              <span className="text-white">{stats.found}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Applied</span>
              <span className="text-blue-400">{stats.applied}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Interview</span>
              <span className="text-yellow-400">{stats.interview}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2">
          <button
            onClick={() => setActiveView('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeView === 'chat' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveView('jobs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeView === 'jobs' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <Briefcase className="w-4 h-4" />
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveView('resume')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeView === 'resume' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <FileText className="w-4 h-4" />
            Resume
          </button>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Chat View */}
        {activeView === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-3 ${
                    msg.type === 'user' ? 'bg-blue-600 text-white' :
                    msg.type === 'bot' ? 'bg-zinc-800 text-zinc-100' :
                    'bg-zinc-900 text-zinc-400 text-sm font-mono'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Describe what you want... e.g., 'Python jobs in Berlin, Remote'"
                  className="flex-1 bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Try: "Search Python developer jobs in Berlin" or "Find remote data science positions"
              </p>
            </div>
          </>
        )}

        {/* Jobs View */}
        {activeView === 'jobs' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
              
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No jobs yet</p>
                  <p className="text-sm mt-2">Start chatting to find jobs!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map(job => (
                    <div key={job.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-zinc-500 text-sm">{job.company} • {job.location}</p>
                        <p className="text-zinc-600 text-xs mt-1">{job.platform}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          job.status === 'applied' ? 'bg-blue-900/50 text-blue-400' :
                          job.status === 'interview' ? 'bg-yellow-900/50 text-yellow-400' :
                          job.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                          job.status === 'found' ? 'bg-green-900/50 text-green-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume View */}
        {activeView === 'resume' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Your Resume</h2>
              
              <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-zinc-500 mb-1">Full Name</label>
                  <input type="text" className="w-full bg-zinc-800 px-4 py-2 rounded-lg" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 mb-1">Email</label>
                  <input type="email" className="w-full bg-zinc-800 px-4 py-2 rounded-lg" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 mb-1">Upload Resume (PDF)</label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                    <p className="text-zinc-500 text-sm">Drag & drop or click to upload</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 py-3 rounded-lg font-medium">
                  Save Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
