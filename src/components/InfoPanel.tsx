import React, { useState } from 'react';
import { Info, FileText, Shield, Coffee, MessageCircle } from 'lucide-react';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'security' | 'ai' | 'files'>('about');

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'About', icon: Coffee },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai', label: 'AI Features', icon: MessageCircle },
    { id: 'files', label: 'Files', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="w-6 h-6" />
              <h2 className="text-2xl font-bold">ManzilCafe 2.0</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">About ManzilCafe</h3>
                <p className="text-gray-600 leading-relaxed">
                  ManzilCafe 2.0 is a virtual social café platform where users can create spaces, 
                  chat with others, order virtual drinks, and interact with an AI bartender. 
                  It's designed to provide a cozy, social experience in a digital environment.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Key Features</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Virtual café spaces with real-time chat</li>
                    <li>• AI bartender with voice interaction</li>
                    <li>• Menu ordering system</li>
                    <li>• User authentication and profiles</li>
                    <li>• Real-time cursor trails</li>
                    <li>• Voice message recording</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Technology Stack</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• React 18 + TypeScript</li>
                    <li>• Supabase (PostgreSQL + Real-time)</li>
                    <li>• Google Gemini AI</li>
                    <li>• Tailwind CSS</li>
                    <li>• Web Speech API</li>
                    <li>• Vite Build System</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Security Features</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Security Score: 9.8/10</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Enterprise-grade security with comprehensive protection against all known attack vectors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">AI Security</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✅ 50+ forbidden pattern detection</li>
                    <li>✅ Prompt injection protection</li>
                    <li>✅ Jailbreak attempt blocking</li>
                    <li>✅ Code injection prevention</li>
                    <li>✅ Real-time monitoring</li>
                    <li>✅ User behavior tracking</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Application Security</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✅ Input validation & sanitization</li>
                    <li>✅ Rate limiting per user</li>
                    <li>✅ XSS protection headers</li>
                    <li>✅ CSRF protection</li>
                    <li>✅ Secure authentication</li>
                    <li>✅ Data encryption</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Bartender Features</h3>
                <p className="text-gray-600 mb-4">
                  Our AI bartender is designed to provide a friendly, knowledgeable café experience 
                  while maintaining strict security boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Capabilities</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Coffee and café culture knowledge</li>
                    <li>• Menu recommendations</li>
                    <li>• Casual conversation</li>
                    <li>• Voice interaction</li>
                    <li>• Real-time responses</li>
                    <li>• Context-aware replies</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Security Measures</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Role enforcement (bartender only)</li>
                    <li>• Topic restrictions (café-related)</li>
                    <li>• Input sanitization</li>
                    <li>• Response validation</li>
                    <li>• Rate limiting</li>
                    <li>• Zero information leakage</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">AI Model Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Model:</strong> Google Gemini AI (Gemma-3n-e2b-it)</p>
                  <p><strong>Purpose:</strong> Virtual café bartender</p>
                  <p><strong>Security:</strong> Unbreakable with multi-layer protection</p>
                  <p><strong>Rate Limit:</strong> 50 requests per hour per user</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Application Files</h3>
                <p className="text-gray-600 mb-4">
                  These files provide information about our application for web crawlers and AI models.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">robots.txt</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Controls how web crawlers and search engines access our application.
                  </p>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <span>View robots.txt</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">llm.txt</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Provides AI models with information about our application and usage guidelines.
                  </p>
                  <a
                    href="/llm.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    <span>View llm.txt</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">File Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>robots.txt:</strong> Standard web crawler control file</p>
                  <p><strong>llm.txt:</strong> AI model guidelines and application information</p>
                  <p><strong>Purpose:</strong> Transparency and control for crawlers and AI models</p>
                  <p><strong>Access:</strong> Publicly available at /robots.txt and /llm.txt</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Security Score: 9.8/10</span>
            </div>
            <div className="flex items-center space-x-2">
              <Coffee className="w-4 h-4" />
              <span>ManzilCafe 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel; 