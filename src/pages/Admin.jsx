import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, resetConfig } from '../services/config';

const Admin = () => {
    const [config, setConfig] = useState(getConfig());
    const [activeTab, setActiveTab] = useState('model'); // 'model' | 'prompts'
    const [status, setStatus] = useState('');

    useEffect(() => {
        setConfig(getConfig());
    }, []);

    const handleChange = (section, key, value) => {
        if (section) {
            setConfig(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            }));
        } else {
            setConfig(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSave = () => {
        saveConfig(config);
        setStatus('Saved successfully!');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleReset = () => {
        if (confirm('Reset all settings to default?')) {
            resetConfig();
            setConfig(getConfig());
            setStatus('Reset to defaults.');
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-2xl font-bold text-[#B8955F]">VIVE AI Admin Console</h1>
                <div className="space-x-4">
                    <span className="text-sm text-gray-400">Environment: {import.meta.env.MODE}</span>
                    <button onClick={() => window.location.hash = ''} className="text-sm underline">Back to App</button>
                </div>
            </header>

            <div className="flex space-x-6 mb-8">
                <button
                    onClick={() => setActiveTab('model')}
                    className={`px-4 py-2 rounded ${activeTab === 'model' ? 'bg-[#B8955F] text-black' : 'bg-gray-800'}`}
                >
                    Model Settings
                </button>
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={`px-4 py-2 rounded ${activeTab === 'prompts' ? 'bg-[#B8955F] text-black' : 'bg-gray-800'}`}
                >
                    Prompt Editor
                </button>
            </div>

            {status && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
                    {status}
                </div>
            )}

            <main className="max-w-4xl">
                {activeTab === 'model' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Provider Selection */}
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Active Provider</h2>
                            <select
                                value={config.provider}
                                onChange={(e) => handleChange(null, 'provider', e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-[#B8955F] focus:outline-none"
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="doubao">Doubao (Volcengine)</option>
                            </select>
                        </div>

                        {/* Gemini Settings */}
                        <div className={`bg-gray-800 p-6 rounded-lg border-l-4 ${config.provider === 'gemini' ? 'border-[#B8955F]' : 'border-transparent opacity-50'}`}>
                            <h2 className="text-xl font-semibold mb-4">Gemini Configuration</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Base URL</label>
                                    <input
                                        type="text"
                                        value={config.gemini.baseUrl}
                                        onChange={(e) => handleChange('gemini', 'baseUrl', e.target.value)}
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Text API Key</label>
                                    <input
                                        type="password"
                                        value={config.gemini.textKey}
                                        onChange={(e) => handleChange('gemini', 'textKey', e.target.value)}
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Image API Key</label>
                                    <input
                                        type="password"
                                        value={config.gemini.imageKey}
                                        onChange={(e) => handleChange('gemini', 'imageKey', e.target.value)}
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Doubao Settings */}
                        <div className={`bg-gray-800 p-6 rounded-lg border-l-4 ${config.provider === 'doubao' ? 'border-[#B8955F]' : 'border-transparent opacity-50'}`}>
                            <h2 className="text-xl font-semibold mb-4">Doubao (Volcengine) Configuration</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Base URL (OpenAI Compatible Endpoint)</label>
                                    <input
                                        type="text"
                                        value={config.doubao.baseUrl}
                                        onChange={(e) => handleChange('doubao', 'baseUrl', e.target.value)}
                                        placeholder="https://ark.cn-beijing.volces.com/api/v3"
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">API Key</label>
                                    <input
                                        type="password"
                                        value={config.doubao.apiKey}
                                        onChange={(e) => handleChange('doubao', 'apiKey', e.target.value)}
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Text Model ID (ARK Endpoint)</label>
                                    <input
                                        type="text"
                                        value={config.doubao.model}
                                        onChange={(e) => handleChange('doubao', 'model', e.target.value)}
                                        placeholder="ep-2024..."
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">CV/Image Model ID</label>
                                    <input
                                        type="text"
                                        value={config.doubao.imageModel}
                                        onChange={(e) => handleChange('doubao', 'imageModel', e.target.value)}
                                        placeholder="cv-generation-..."
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prompts' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Text Analysis Prompt</h2>
                            <p className="text-sm text-gray-400 mb-2">Instructions for Vision API to extract Keyword & Attitude.</p>
                            <textarea
                                value={config.prompts.textAnalysis}
                                onChange={(e) => handleChange('prompts', 'textAnalysis', e.target.value)}
                                className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded font-mono text-sm leading-relaxed focus:border-[#B8955F] focus:outline-none"
                            />
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Image Generation Prompt Template</h2>
                            <p className="text-sm text-gray-400 mb-2">
                                Available variables: <code className="text-[#B8955F]">{`{{style1920}}`}</code>, <code className="text-[#B8955F]">{`{{style2026}}`}</code>, <code className="text-[#B8955F]">{`{{scene}}`}</code>
                            </p>
                            <textarea
                                value={config.prompts.imageGeneration}
                                onChange={(e) => handleChange('prompts', 'imageGeneration', e.target.value)}
                                className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded font-mono text-sm leading-relaxed focus:border-[#B8955F] focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                <div className="flex space-x-4 mt-8 pt-8 border-t border-gray-700">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-[#B8955F] text-black font-bold rounded hover:brightness-110 transition-all"
                    >
                        Save Configuration
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-8 py-3 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-all"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Admin;
