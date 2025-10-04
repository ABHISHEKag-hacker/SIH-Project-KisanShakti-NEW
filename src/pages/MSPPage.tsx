// src/pages/MSPPage.tsx (Upgraded with Comparison Graph, YoY Change, and Calculator)

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Search, BarChart2, ChevronDown, Loader2, ChevronsUpDown, ArrowUp, ArrowDown, Calculator } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import mspJsonData from '../data/mspData.json'; // Import the local JSON data

interface MspRecord {
  commodity: string;
  msps: { [year: string]: number | null };
}

// Pre-defined colors for the graph lines
const lineColors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ef4444"];

const MSPPage: React.FC = () => {
  const { translations, language } = useLanguage();
  const T = translations.mspPage || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [mspData, setMspData] = useState<MspRecord[]>([]);  
  const [loading, setLoading] = useState(true);
  
  // State for multi-select graph
  const [selectedCrops, setSelectedCrops] = useState<MspRecord[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State for Calculator
  const [calcCrop, setCalcCrop] = useState<MspRecord | null>(null);
  const [landSize, setLandSize] = useState<number | string>('');
  const [expectedYield, setExpectedYield] = useState<number | string>('');


  useEffect(() => {
    setMspData(mspJsonData);
    if (mspJsonData.length > 0) {
      // Set default crops for the graph and calculator
      setSelectedCrops([mspJsonData[0], mspJsonData[1]]); 
      setCalcCrop(mspJsonData[0]);
    }
    setLoading(false);
  }, []);

  const handleCropSelection = (crop: MspRecord) => {
    setSelectedCrops(prev => {
      const isSelected = prev.find(c => c.commodity === crop.commodity);
      if (isSelected) {
        return prev.filter(c => c.commodity !== crop.commodity);
      } else {
        if (prev.length < 4) { // Limit to 4 crops for readability
            return [...prev, crop];
        }
        return prev;
      }
    });
  };

  const chartData = useMemo(() => {
    if (selectedCrops.length === 0) return [];

    const allYears = new Set<string>();
    selectedCrops.forEach(crop => {
        Object.keys(crop.msps).forEach(year => allYears.add(year));
    });

    const sortedYears = Array.from(allYears).sort();

    return sortedYears.map(year => {
        const dataPoint: { year: string, [key: string]: any } = { year };
        selectedCrops.forEach(crop => {
            dataPoint[crop.commodity] = crop.msps[year] || null;
        });
        return dataPoint;
    });
  }, [selectedCrops]);

  const filteredData = mspData.filter(item => 
    item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateYoYChange = (msps: { [year: string]: number | null }): number | null => {
      const years = Object.keys(msps).sort();
      if(years.length < 2) return null;

      const latestYear = years[years.length - 1];
      const previousYear = years[years.length - 2];

      const latestPrice = msps[latestYear];
      const previousPrice = msps[previousYear];

      if(latestPrice && previousPrice) {
          return ((latestPrice - previousPrice) / previousPrice) * 100;
      }
      return null;
  }

  const potentialEarnings = useMemo(() => {
    if (!calcCrop || !landSize || !expectedYield) return 0;
    const latestYear = Object.keys(calcCrop.msps).sort().pop();
    if (!latestYear) return 0;
    const latestPrice = calcCrop.msps[latestYear] || 0;
    return (Number(landSize) * Number(expectedYield)) * latestPrice;
  }, [calcCrop, landSize, expectedYield]);


  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          {translations.navigation.msp?.['language'] || 'Government MSP Analysis'}
        </h1>

        {/* --- Price Comparison Graph --- */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 mb-6 border dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3 md:mb-0">
                    <BarChart2 className="w-6 h-6 text-blue-500" />
                    Price Comparison Tool
                </h2>
                <div className="relative w-full md:w-72">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg">
                        <span className="truncate">{selectedCrops.length > 0 ? `${selectedCrops.length} crop(s) selected` : 'Select Crops to Compare'}</span>
                        <ChevronsUpDown className="w-5 h-5" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {mspData.map(crop => (
                                <label key={crop.commodity} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                    <input type="checkbox"
                                        checked={selectedCrops.some(c => c.commodity === crop.commodity)}
                                        onChange={() => handleCropSelection(crop)}
                                        className="form-checkbox h-4 w-4 text-green-600 rounded"
                                    />
                                    <span>{crop.commodity}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="h-80 w-full">
                {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div> : 
                 chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} />
                            <YAxis tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            {selectedCrops.map((crop, index) => (
                                <Line key={crop.commodity} type="monotone" dataKey={crop.commodity} stroke={lineColors[index % lineColors.length]} strokeWidth={2} activeDot={{ r: 8 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-gray-500">Select one or more crops to see the graph.</div>
                }
            </div>
        </div>

        {/* --- Profitability Calculator --- */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 md:p-6 mb-6 border border-blue-100 dark:border-blue-800">
            <h2 className="text-lg md:text-xl font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
                <Calculator className="w-6 h-6" />
                Profitability Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Crop</label>
                    <select value={calcCrop?.commodity || ''} onChange={e => setCalcCrop(mspData.find(c => c.commodity === e.target.value) || null)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
                        {mspData.map(c => <option key={c.commodity} value={c.commodity}>{c.commodity}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Land Size (acres)</label>
                    <input type="number" value={landSize} onChange={e => setLandSize(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., 5"/>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Yield (quintal/acre)</label>
                    <input type="number" value={expectedYield} onChange={e => setExpectedYield(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., 10"/>
                </div>
                <div className="md:col-span-1 bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Potential Earnings</p>
                    <p className="text-2xl font-bold text-green-600">₹{potentialEarnings.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>

        {/* --- MSP Table with YoY Change --- */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a crop..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent text-gray-800 dark:text-gray-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden">
            <thead className="text-left bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Crop (Commodity)</th>
                <th className="p-4">Latest MSP (₹ per Quintal)</th>
                <th className="p-4">YoY Change</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" /></td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const latestYear = Object.keys(item.msps).sort().pop();
                  const latestPrice = latestYear ? item.msps[latestYear] : 'N/A';
                  const yoyChange = calculateYoYChange(item.msps);
                  return (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.commodity}</td>
                    <td className="p-4 text-green-600 font-semibold">{latestPrice}</td>
                    <td className="p-4">
                        {yoyChange !== null ? (
                            <span className={`flex items-center font-semibold ${yoyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {yoyChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1"/> : <ArrowDown className="w-4 h-4 mr-1"/>}
                                {yoyChange.toFixed(2)}%
                            </span>
                        ) : 'N/A'}
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No crops found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MSPPage;