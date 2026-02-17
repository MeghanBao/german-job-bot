import { useState, useEffect } from 'react';
import { Send, Upload, Search, Briefcase, FileText, Settings, Trash2, ExternalLink, Check, X, Clock, Building2, MapPin, Euro } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary?: string;
  description?: string;
  url?: string;
  status: string;
  appliedAt?: string;
}

interface Resume {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'jobs' | 'resume' | 'settings'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resume, setResume] = useState<Resume>({ name: '', email: '', phone: '', summary: '', skills: [] });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSavingResume, setIsSavingResume] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchResume();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) { console.error(e); }
  };

  const fetchResume = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.name) setResume(data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Parse search query
      const keywords = searchQuery;
      const location = 'Germany';
      
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, location })
      });
      const data = await res.json();
      setSearchResults(data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const applyToJob = async (job: Job) => {
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...job, status: 'applied' })
      });
      setSearchResults(prev => prev.filter(j => j.id !== job.id));
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
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

  const saveResume = async () => {
    setIsSavingResume(true);
    try {
      await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });
    } catch (e) { console.error(e); }
    setIsSavingResume(false);
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      await fetch('/api/resume/upload', { method: 'POST', body: formData });
      alert('Resume uploaded!');
    } catch (e) { console.error(e); }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    rejected: jobs.filter(j => j.status === 'rejected').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-400';
      case 'interview': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'offered': return 'bg-green-500/20 text-green-400';
      default: return 'bg-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-medium">
            German Job Bot <span className="text-zinc-500">🇩🇪</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('search')} className={`p-2 rounded ${activeTab === 'search' ? 'bg-zinc-800' : 'text-zinc-500'}`}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('jobs')} className={`p-2 rounded ${activeTab === 'jobs' ? 'bg-zinc-800' : 'text-zinc-500'}`}>
              <Briefcase className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('resume')} className={`p-2 rounded ${activeTab === 'resume' ? 'bg-zinc-800' : 'text-zinc-500'}`}>
              <FileText className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('settings')} className={`p-2 rounded ${activeTab === 'settings' ? 'bg-zinc-800' : 'text-zinc-500'}`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="z.B. Python Developer Berlin..."
                className="flex-1 bg-zinc-900 px-4 py-3 rounded-lg border border-zinc-800 focus:border-zinc-600 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Search Stats */}
            <div className="flex gap-4 text-sm text-zinc-500">
              <span>{jobs.length} Jobs saved</span>
              <span>•</span>
              <span>{stats.applied} Applied</span>
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="text-center py-8 text-zinc-500">
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-zinc-500 text-sm">Search Results</h3>
                {searchResults.map(job => (
                  <div key={job.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                            <Euro className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyToJob(job)}
                          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Search for jobs in Germany</p>
                <p className="text-sm mt-2">Try: "Python Developer Berlin" or "Data Scientist Remote"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: 'Total', value: stats.total, color: 'text-white' },
                { label: 'Applied', value: stats.applied, color: 'text-blue-400' },
                { label: 'Interview', value: stats.interview, color: 'text-yellow-400' },
                { label: 'Rejected', value: stats.rejected, color: 'text-red-400' }
              ].map(stat => (
                <div key={stat.label} className="bg-zinc-900 p-3 rounded-lg text-center">
                  <div className={`text-xl font-medium ${stat.color}`}>{stat.value}</div>
                  <div className="text-zinc-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Job List */}
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No jobs yet</p>
                <p className="text-sm mt-2">Search and apply to jobs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.platform}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                          {job.salary && <span>•</span>}
                          {job.salary && <span className="text-green-400">{job.salary}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status}
                          onChange={(e) => updateJobStatus(job.id, e.target.value)}
                          className={`px-3 py-1 rounded text-sm ${getStatusColor(job.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="applied">Applied</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="offered">Offered</option>
                        </select>
                        <button onClick={() => deleteJob(job.id)} className="text-zinc-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {job.appliedAt && (
                      <div className="text-zinc-600 text-xs mt-2">
                        Applied: {job.appliedAt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Upload */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <h3 className="font-medium mb-3">Upload PDF Resume</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-zinc-500"
                />
                <button
                  onClick={uploadResume}
                  disabled={!resumeFile}
                  className="bg-zinc-800 px-4 py-2 rounded text-sm disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-3">
              <h3 className="font-medium">Profile</h3>
              <input
                type="text"
                placeholder="Name"
                value={resume.name}
                onChange={(e) => setResume({ ...resume, name: e.target.value })}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700"
              />
              <input
                type="email"
                placeholder="Email"
                value={resume.email}
                onChange={(e) => setResume({ ...resume, email: e.target.value })}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={resume.phone}
                onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700"
              />
              <textarea
                placeholder="Summary"
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700 h-24"
              />
              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={resume.skills.join(', ')}
                onChange={(e) => setResume({ ...resume, skills: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700"
              />
              <button
                onClick={saveResume}
                disabled={isSavingResume}
                className="w-full bg-white text-black py-2 rounded font-medium disabled:opacity-50"
              >
                {isSavingResume ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <h3 className="font-medium mb-3">Settings</h3>
              <div className="space-y-3 text-sm text-zinc-500">
                <p>Version: 1.0.0</p>
                <p>Platforms: LinkedIn, Indeed, StepStone, Xing (Coming Soon)</p>
                <p className="pt-2">German Job Bot helps you find and apply to jobs in Germany. Built with ❤️</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
