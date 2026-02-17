import { useState, useEffect, useRef } from 'react';
import { Send, Briefcase, FileText, Settings, Plus, Trash2, CheckCircle, Clock, XCircle, Sparkles, User, MessageCircle, TrendingUp, Target, Shield, Zap, Globe, Bot } from 'lucide-react';

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
  type: 'user' | 'bot' | 'action' | 'success' | 'error';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', content: '👋 Hi! I\'m your German Job Bot.' },
    { id: '2', type: 'bot', content: 'Tell me what job you\'re looking for, like: "Find Python jobs in Berlin" or "Search remote data science positions in Germany"' }
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

    // Simulate bot thinking process like apply-bot
    setTimeout(() => {
      addMessage('action', '💭 I need to search for jobs in Germany...');
    }, 500);

    setTimeout(() => {
      addMessage('action', '🔍 Navigating to job platforms...');
    }, 1500);

    setTimeout(() => {
      addMessage('action', '✓ Found positions matching your criteria');
    }, 2500);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: userInput, location: 'Germany' })
        });
        const data = await res.json();
        
        if (data.jobs && data.jobs.length > 0) {
          addMessage('success', `📋 Found ${data.jobs.length} positions! Adding to your list.`);
          
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
          addMessage('error', '😕 No jobs found. Try different keywords!');
        }
      } catch (e) {
        addMessage('error', '❌ Error searching jobs. Please try again.');
      }
      setIsTyping(false);
    }, 3500);
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const applyToJob = async (job: Job) => {
    if (!job.url || job.url === '#') {
      alert('No URL available for this job');
      return;
    }
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: job.url,
          platform: job.platform,
          resumePath: 'data/resume.pdf'
        })
      });
      const result = await res.json();
      if (result.success) {
        updateJobStatus(job.id, 'applied');
        alert('✅ Application submitted successfully!');
      } else {
        alert('❌ ' + result.message);
      }
    } catch (e) {
      console.error(e);
      alert('❌ Failed to apply');
    }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    found: jobs.filter(j => j.status === 'found').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'interview': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'found': return <Target className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-zinc-400" />;
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

        {/* Stats */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <TrendingUp className="w-3 h-3" />
            Your Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Found</span>
              <span className="text-green-400">{stats.found}</span>
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

        {/* Features */}
        <div className="p-4 border-b border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2">Why German Job Bot?</div>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>DE job platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-green-400" />
              <span>Privacy first</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Easy to use</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2">
          <button
            onClick={() => setActiveView('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeView === 'chat' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveView('jobs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeView === 'jobs' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <Briefcase className="w-4 h-4" />
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveView('resume')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mt-1 ${activeView === 'resume' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
          >
            <FileText className="w-4 h-4" />
            Resume
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
        {/* Chat View */}
        {activeView === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                    msg.type === 'user' ? 'bg-blue-600 text-white' :
                    msg.type === 'bot' ? 'bg-zinc-800 text-zinc-100' :
                    msg.type === 'action' ? 'bg-zinc-900/50 text-zinc-400 text-sm font-mono' :
                    msg.type === 'success' ? 'bg-green-900/30 text-green-400 text-sm' :
                    msg.type === 'error' ? 'bg-red-900/30 text-red-400 text-sm' :
                    'bg-zinc-800 text-zinc-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 rounded-2xl px-5 py-3">
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
            <div className="p-6 border-t border-zinc-800">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Describe what you want... e.g., 'Python jobs in Berlin, Remote'"
                  className="flex-1 bg-zinc-900 px-5 py-4 rounded-xl border border-zinc-700 focus:border-blue-500 focus:outline-none text-lg"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-3">
                Try: "Search Python developer jobs in Berlin" or "Find remote data science positions"
              </p>
            </div>
          </>
        )}

        {/* Jobs View */}
        {activeView === 'jobs' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
              
              {jobs.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-500 text-lg">No jobs yet</p>
                  <p className="text-zinc-600 text-sm mt-2">Start chatting to find jobs!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map(job => (
                    <div key={job.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{job.title}</h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="text-blue-400">{job.platform}</span>
                        </div>
                        {job.salary && (
                          <div className="text-green-400 text-sm mt-1">{job.salary}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'found' && (
                          <button
                            onClick={() => applyToJob(job)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Apply
                          </button>
                        )}
                        <select
                          value={job.status}
                          onChange={(e) => updateJobStatus(job.id, e.target.value)}
                          className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${
                            job.status === 'applied' ? 'bg-blue-900/50 text-blue-400' :
                            job.status === 'interview' ? 'bg-yellow-900/50 text-yellow-400' :
                            job.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                            job.status === 'found' ? 'bg-green-900/50 text-green-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          <option value="found">Found</option>
                          <option value="applied">Applied</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="offered">Offered</option>
                        </select>
                        <button onClick={() => deleteJob(job.id)} className="text-zinc-500 hover:text-red-400 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Your Resume</h2>
              
              <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-zinc-500 mb-2">Full Name</label>
                  <input type="text" className="w-full bg-zinc-800 px-4 py-3 rounded-lg border border-zinc-700" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 mb-2">Email</label>
                  <input type="email" className="w-full bg-zinc-800 px-4 py-3 rounded-lg border border-zinc-700" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 mb-2">Upload Resume (PDF)</label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-600">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-zinc-500" />
                    <p className="text-zinc-500">Drag & drop or click to upload</p>
                    <p className="text-zinc-600 text-xs mt-1">PDF up to 10MB</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium">
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
