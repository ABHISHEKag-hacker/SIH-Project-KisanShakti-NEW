// src/pages/SoilReportPage.tsx (Corrected)

import React, { useState } from 'react';
import { Beaker, Upload, FileText, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface SoilNutrient {
  nutrient: string;
  value: number;
  ideal: number;
  status: string;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const SoilReportPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [soilData, setSoilData] = useState<SoilNutrient[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSoilData([]);
      setRecommendations([]);
      setError(null);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('soilReport', uploadedFile);

    try {
      const res = await fetch('http://localhost:5174/api/analyze-soil-report', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server responded with status: ${res.status}`);
      }

      const parsedResponse = await res.json();

      if (parsedResponse.soilData && parsedResponse.recommendations) {
        setSoilData(parsedResponse.soilData);
        setRecommendations(parsedResponse.recommendations);

        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, "soilReports"), {
            uid: user.uid,
            fileName: uploadedFile?.name,
            soilData: parsedResponse.soilData,
            recommendations: parsedResponse.recommendations,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        throw new Error("Invalid data structure received from the server.");
      }
    } catch (err: any) {
      setError(`Failed to analyze report: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-800 dark:text-red-300';
      case 'medium': return 'text-yellow-800 dark:text-yellow-300';
      case 'low': return 'text-green-800 dark:text-green-300';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 flex items-center gap-3">
          <Beaker className="w-8 h-8 text-green-600" />
          Soil & Fertilizer Hub
        </h1>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl p-6 mb-8 border border-blue-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Upload Soil Report
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" id="soil-upload" />
                <label htmlFor="soil-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-blue-400 dark:text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </label>
              </div>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-800 dark:text-green-300 font-medium">{uploadedFile.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">What we analyze:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>Nitrogen, Phosphorus, Potassium</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>Soil pH and organic carbon</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>Micronutrients and soil texture</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>Customized fertilizer advice</li>
              </ul>

              <button onClick={handleAnalyzeReport} disabled={!uploadedFile || loading}
                className={`w-full text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${uploadedFile && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}>
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Analyzing...' : 'Analyze Report'}
              </button>
            </div>
          </div>
        </div>

        {error && (<div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>)}

        {!loading && soilData.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-green-600" />Soil Nutrient Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {soilData.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{item.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.nutrient}</div>
                      <div className={`text-xs px-2 py-1 rounded-full mx-auto w-fit ${item.status === 'High' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          item.status === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        }`}>{item.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Nutrient Profile</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={soilData}>
                      <PolarGrid stroke="rgba(128, 128, 128, 0.2)" />
                      <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgb(107 114 128)' }} />
                      <Radar name="Current" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.4} strokeWidth={2} />
                      <Radar name="Ideal" dataKey="ideal" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} strokeDasharray="5 5" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-yellow-500" />Expert Recommendations</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`border rounded-xl p-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-1 ${getPriorityTextColor(rec.priority)}`}>{rec.title}</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec.description}</p>
                        <div className="mt-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                                'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                            }`}>{rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SoilReportPage;