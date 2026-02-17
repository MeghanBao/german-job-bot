import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Settings, 
  Play, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Upload,
  Activity
} from 'lucide-react';

// Types
interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary?: string;
  status: 'applied' | 'interview' | 'rejected' | 'offered' | 'pending';
  appliedAt: string;
  url?: string;
}

interface Filters {
  keywords: string[];
  locations: string[];
  salaryMin: number;
  requireVisa: boolean;
  blacklistCompanies: string[];
  whitelistCompanies: string[];
}

interface Resume {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<Filters>({
    keywords: [],
    locations: ['Germany'],
    salaryMin: 0,
    requireVisa: false,
    blacklistCompanies: [],
    whitelistCompanies: []
  });
  const [resume, setResume] = useState<Resume>({
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: []
  });
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<{message: string; type: string; timestamp: string}[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchFilters();
    fetchResume();
    fetchLogs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/applied');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/filters');
      const data = await res.json();
      if (data.keywords) setFilters(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResume = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.name) setResume(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.sessions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const saveFilters = async () => {
    await fetch('/api/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    addLog('Filters saved', 'system');
  };

  const saveResume = async () => {
    await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume)
    });
    addLog('Resume saved', 'system');
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Resume uploaded: ${resumeFile.name}`, 'system');
        // Parse the resume
        await fetch(`/api/resumes/parse/${resumeFile.name}`, { method: 'POST' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addLog = async (message: string, type: string = 'user') => {
    const log = { message, type, timestamp: new Date().toISOString() };
    setLogs(prev => [log, ...prev.slice(0, 49)]);
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    } catch (e) {}
  };

  const handleCommand = () => {
    if (!command.trim()) return;
    addLog(command, 'user');
    addLog(`🤖 Processing: "${command}"...`, 'bot');
    setCommand('');
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    offered: jobs.filter(j => j.status === 'offered').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'interview': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'offered': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            German Job Bot 🇩🇪
          </h1>
          <span className="text-sm opacity-80">AI-powered job search</span>
        </div>
      </header>

      {/* Command Bar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
            placeholder="Befehl eingeben... z.B. 'Suche Python Jobs in Berlin'"
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleCommand}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Play className="w-4 h-4" />Start
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto flex">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'jobs', icon: Briefcase, label: 'Jobs' },
            { id: 'filters', icon: Settings, label: 'Filters' },
            { id: 'resume', icon: FileText, label: 'Resume' },
            { id: 'logs', icon: Search, label: 'Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium capitalize transition flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'text-white' },
                { label: 'Applied', value: stats.applied, color: 'text-blue-400' },
                { label: 'Interview', value: stats.interview, color: 'text-yellow-400' },
                { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
                { label: 'Offered', value: stats.offered, color: 'text-green-400' }
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800 p-6 rounded-xl">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setCommand('Search Python Jobs in Berlin')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <Search className="w-5 h-5 mb-2 text-blue-400" />
                  <div className="font-medium">Search Jobs</div>
                  <div className="text-sm text-gray-400">Find positions</div>
                </button>
                <button 
                  onClick={() => setActiveTab('resume')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <Upload className="w-5 h-5 mb-2 text-green-400" />
                  <div className="font-medium">Upload Resume</div>
                  <div className="text-sm text-gray-400">Add PDF</div>
                </button>
                <button 
                  onClick={() => setActiveTab('filters')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <Settings className="w-5 h-5 mb-2 text-purple-400" />
                  <div className="font-medium">Configure</div>
                  <div className="text-sm text-gray-400">Set filters</div>
                </button>
                <button 
                  onClick={() => fetchJobs()}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <Activity className="w-5 h-5 mb-2 text-yellow-400" />
                  <div className="font-medium">Refresh</div>
                  <div className="text-sm text-gray-400">Update data</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-xl">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Jobs gefunden</p>
                <p className="text-sm mt-2">Gib einen Befehl wie "Suche Python Jobs in Berlin"</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-gray-400">{job.company} • {job.platform}</p>
                    <p className="text-sm text-gray-500">{job.location} {job.salary && `• ${job.salary}`}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      job.status === 'applied' ? 'bg-blue-900/30 text-blue-300' :
                      job.status === 'interview' ? 'bg-yellow-900/30 text-yellow-300' :
                      job.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                      job.status === 'offered' ? 'bg-green-900/30 text-green-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                    <span className="text-sm text-gray-500">{job.appliedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Filters */}
        {activeTab === 'filters' && (
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Suchfilter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Stichwörter (kommagetrennt)</label>
                <input
                  type="text"
                  value={filters.keywords.join(', ')}
                  onChange={(e) => setFilters({...filters, keywords: e.target.value.split(',').map(k => k.trim())})}
                  className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                  placeholder="Python, Backend, Data Science"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Standorte</label>
                <input
                  type="text"
                  value={filters.locations.join(', ')}
                  onChange={(e) => setFilters({...filters, locations: e.target.value.split(',').map(l => l.trim())})}
                  className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                  placeholder="Berlin, Remote, München"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Mindestgehalt (€)</label>
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({...filters, salaryMin: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.requireVisa}
                  onChange={(e) => setFilters({...filters, requireVisa: e.target.checked})}
                />
                <label>Nur Visa-Sponsoring</label>
              </div>
              <button
                onClick={saveFilters}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
              >
                Speichern
              </button>
            </div>
          </div>
        )}

        {/* Resume */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Lebenslauf hochladen</h2>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="mb-4"
                />
                {resumeFile && (
                  <button
                    onClick={uploadResume}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                  >
                    Hochladen & Parsen
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Persönliche Daten</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={resume.name}
                      onChange={(e) => setResume({...resume, name: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">E-Mail</label>
                    <input
                      type="email"
                      value={resume.email}
                      onChange={(e) => setResume({...resume, email: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={resume.phone}
                    onChange={(e) => setResume({...resume, phone: e.target.value})}
                    className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Zusammenfassung</label>
                  <textarea
                    value={resume.summary}
                    onChange={(e) => setResume({...resume, summary: e.target.value})}
                    className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600 h-24"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Fähigkeiten (kommagetrennt)</label>
                  <input
                    type="text"
                    value={resume.skills.join(', ')}
                    onChange={(e) => setResume({...resume, skills: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full bg-gray-700 px-4 py-2 rounded border border-gray-600"
                    placeholder="Python, JavaScript, React, Docker"
                  />
                </div>
                <button
                  onClick={saveResume}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Logs</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Keine Logs</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`p-3 rounded ${
                    log.type === 'user' ? 'bg-blue-900/30' :
                    log.type === 'bot' ? 'bg-purple-900/30' :
                    'bg-gray-700'
                  }`}>
                    <span className="text-gray-500 text-sm">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
