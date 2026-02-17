import { useState, useEffect } from 'react';
import { Send, Upload, Settings, Activity, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  status: string;
  appliedAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'jobs' | 'resume'>('search');
  const [command, setCommand] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumeName, setResumeName] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/applied')
      .then(r => r.json())
      .then(data => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!command.trim()) return;
    setIsLoading(true);
    
    // Simulate search - in real app, this would call AI/Playwright
    setTimeout(() => {
      const newJob: Job = {
        id: Date.now().toString(),
        title: 'Software Engineer',
        company: 'Tech Company',
        platform: 'LinkedIn',
        location: 'Berlin',
        status: 'pending',
        appliedAt: new Date().toISOString().split('T')[0]
      };
      setJobs(prev => [newJob, ...prev]);
      setIsLoading(false);
    }, 1500);
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-light tracking-wide">
          German Job Bot <span className="text-zinc-500">🇩🇪</span>
        </h1>
      </header>

      {/* Search */}
      <div className="p-6 border-b border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="z.B. Python Jobs in Berlin, Remote..."
              className="flex-1 bg-zinc-900 px-4 py-3 rounded-lg border border-zinc-800 focus:border-zinc-600 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-zinc-800">
        <div className="max-w-2xl mx-auto flex gap-8">
          <div>
            <div className="text-3xl font-light">{stats.total}</div>
            <div className="text-zinc-500 text-sm">Jobs found</div>
          </div>
          <div>
            <div className="text-3xl font-light">{stats.applied}</div>
            <div className="text-zinc-500 text-sm">Applied</div>
          </div>
          <div>
            <div className="text-3xl font-light">{stats.interview}</div>
            <div className="text-zinc-500 text-sm">Interview</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <p className="text-zinc-500 text-center py-12">
                  Noch keine Jobs. Such z.B. "Python Developer Berlin"
                </p>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="p-4 bg-zinc-900 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-zinc-500 text-sm">{job.company} • {job.location}</div>
                    </div>
                    <span className="text-xs text-zinc-500 uppercase">{job.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900 rounded-lg">
                <label className="block text-zinc-500 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="w-full bg-zinc-800 px-4 py-2 rounded border border-zinc-700"
                />
              </div>
              <div className="p-4 bg-zinc-900 rounded-lg">
                <label className="block text-zinc-500 text-sm mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  value={resumeSkills}
                  onChange={(e) => setResumeSkills(e.target.value)}
                  placeholder="Python, React, Docker..."
                  className="w-full bg-zinc-800 px-4 py-2 rounded border border-zinc-700"
                />
              </div>
              <div className="p-4 bg-zinc-900 rounded-lg border-dashed border-2 border-zinc-700 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                <p className="text-zinc-500 text-sm">Upload PDF Resume</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('search')}
            className={`p-2 ${activeTab === 'search' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Activity className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`p-2 ${activeTab === 'jobs' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`p-2 ${activeTab === 'resume' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Upload className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
