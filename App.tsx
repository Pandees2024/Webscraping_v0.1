
import React, { useState, useCallback } from 'react';
import { ProcessingStatus, CompanyData } from './types';
import { parseProcoreHTML } from './services/geminiService';
import PythonGenerator from './components/PythonGenerator';

const App: React.FC = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [data, setData] = useState<CompanyData[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!htmlInput.trim()) return;
    
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    
    try {
      const results = await parseProcoreHTML(htmlInput);
      setData(results);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError("Failed to parse the content. Ensure your API key is valid and the HTML snippet is readable.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    
    const headers = ['Company Name', 'Phone', 'Email', 'Point of Contact', 'Address', 'Website'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.companyName.replace(/"/g, '""')}"`,
        `"${item.phone}"`,
        `"${item.email}"`,
        `"${item.pointOfContact}"`,
        `"${item.address.replace(/"/g, '""')}"`,
        `"${item.website}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "procore_contacts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Procore Network Extract</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-md text-center md:text-right">
            Intelligently extract company data from Procore's search results or automate full profile scraping.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-6 space-y-12">
        {/* Section 1: Browser Analysis */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs">1</span>
              On-Demand Snippet Parser (Manual)
            </h2>
            <p className="mt-1 text-slate-500 text-sm">
              Paste a specific HTML snippet from a company profile or search list. Gemini will extract all available contact details.
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Paste HTML Content</label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Right click search result > Inspect > Copy Outer HTML... and paste here"
                className="w-full h-48 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono text-xs"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleProcess}
                disabled={status === ProcessingStatus.PROCESSING || !htmlInput.trim()}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-md active:scale-95 ${
                  status === ProcessingStatus.PROCESSING 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {status === ProcessingStatus.PROCESSING ? 'AI is Analyzing...' : 'Analyze Content'}
              </button>
              
              {status === ProcessingStatus.COMPLETED && (
                <button
                  onClick={downloadCSV}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download CSV ({data.length})
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {/* Preview Table */}
            {data.length > 0 && (
              <div className="mt-8 border rounded-xl overflow-hidden border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700">Company</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Phone</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Website</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((company, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{company.companyName}</td>
                          <td className="px-4 py-3 text-slate-600">{company.phone}</td>
                          <td className="px-4 py-3 text-blue-600 underline truncate max-w-[150px]">{company.email}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[150px]">{company.website}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Scraper Generator */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs">2</span>
              Deep Search Automation (Python)
            </h2>
            <p className="text-slate-500 text-sm">
              Use this script to automatically click into every company profile, extract hidden contact details, and save them into a master CSV.
            </p>
          </div>
          <PythonGenerator />
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-inner">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0116 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-800 font-bold">Consolidation Strategy</h3>
              <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                The script above iterates through the <strong>California General Contractor</strong> list, opens each unique <code>/network/p/</code> profile URL, and harvests emails/phones/websites that are usually only visible on sub-pages. This ensures the highest data quality for your consolidated CSV.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 px-8 text-center text-slate-400 text-sm mt-20">
        &copy; 2024 Procore Network Data Toolkit. Powered by Gemini Pro.
      </footer>
    </div>
  );
};

export default App;
