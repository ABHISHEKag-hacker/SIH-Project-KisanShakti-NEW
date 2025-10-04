// src/pages/WeatherPage.tsx (Theme-Aligned, Visually-Focused Redesign)

import React, { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, AlertTriangle, Thermometer, Calendar, CloudRain } from "lucide-react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";

// --- DYNAMIC Historical Data Generation ---
const generateHistoricalDaysData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = date.toLocaleDateString('en-GB', { day: '2-digit' });
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    data.push({
      name: `${day} ${month}`,
      avgTemp: parseFloat((35 + Math.sin(i / 3) * 4 - Math.random() * 3).toFixed(1)),
      totalRainfall: parseFloat((Math.random() > 0.8 ? Math.random() * 15 : 0).toFixed(1)),
    });
  }
  return data.reverse();
};

const historicalWeeksData = Array.from({ length: 12 }, (_, i) => ({ name: `Week ${i + 1}`, avgTemp: parseFloat((34 - i * 0.7 + Math.random() * 2).toFixed(1)), totalRainfall: parseFloat((Math.random() * (40 - i * 2.5)).toFixed(1)) }));
const historicalMonthsData = [ { name: 'Apr', avgTemp: 38.6, totalRainfall: 5 }, { name: 'May', avgTemp: 40.3, totalRainfall: 10 }, { name: 'Jun', avgTemp: 35.1, totalRainfall: 120 }, { name: 'Jul', avgTemp: 28.8, totalRainfall: 300 }, { name: 'Aug', avgTemp: 29.5, totalRainfall: 250 }, { name: 'Sep', avgTemp: 30.2, totalRainfall: 150 } ];
const historicalYearsData = [ { name: '2021', avgTemp: 31.0, totalRainfall: 850 }, { name: '2022', avgTemp: 32.5, totalRainfall: 780 }, { name: '2023', avgTemp: 32.1, totalRainfall: 920 }, { name: '2024', avgTemp: 33.0, totalRainfall: 750 }, { name: '2025', avgTemp: 31.5, totalRainfall: 880 } ];
// --- End of Data Generation ---

// Custom Tooltip for Graphs
const CustomTooltip = ({ active, payload, label, translations, language }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/70 backdrop-blur-lg p-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                <p className="font-bold text-gray-900 dark:text-gray-100">{label}</p>
                <div className="mt-2 space-y-1 text-sm">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center"><Thermometer size={14} className="mr-2"/>{translations.avgTemp?.[language] || 'Avg Temp'}: <span className="font-bold ml-1.5">{payload[1].value}°C</span></p>
                    <p className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center"><CloudRain size={14} className="mr-2"/>{translations.totalRainfall?.[language] || 'Rainfall'}: <span className="font-bold ml-1.5">{payload[0].value} mm</span></p>
                </div>
            </div>
        );
    }
    return null;
};

interface WeatherPageProps {
  currentUser: any;
}

const WeatherPage: React.FC<WeatherPageProps> = ({ currentUser }) => {
  const { translations, language } = useLanguage();
  const T = translations.weatherPage;

  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity] = useState<string>(currentUser?.location?.split(',')[0] || "Ahmedabad");
  
  const [historicalTimeframe, setHistoricalTimeframe] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loadingHistorical, setLoadingHistorical] = useState(true);

  const API_KEY = "6cda69c02716a49abcc0cc15bb1377b1";

  useEffect(() => {
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch data.");
            }
            const data = await response.json();
            setWeatherData(data);
        } catch (err: any) {
            setError(err.message);
            console.error("API Fetch Error:", err);
        } finally {
            setLoading(false);
        }

        const dummyAlerts = [{ severity: 'Red' }];
        setAlerts(dummyAlerts || []);
    };
    fetchAllData();
  }, [selectedCity]);

  useEffect(() => {
    setLoadingHistorical(true);
    setTimeout(() => {
      if (historicalTimeframe === 'days') setHistoricalData(generateHistoricalDaysData());
      if (historicalTimeframe === 'weeks') setHistoricalData(historicalWeeksData);
      if (historicalTimeframe === 'months') setHistoricalData(historicalMonthsData);
      if (historicalTimeframe === 'years') setHistoricalData(historicalYearsData);
      setLoadingHistorical(false);
    }, 500);
  }, [historicalTimeframe]);

  const renderHistoricalChart = () => (
    <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={historicalData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} stroke="rgb(156 163 175)" />
            <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 12, fill: '#10b981' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 12, fill: '#06b6d4' }} />
            <Tooltip content={<CustomTooltip translations={T} language={language} />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Legend formatter={(value) => T[value.toLowerCase().replace(/ /g, '')]?.[language] || value} iconSize={12} wrapperStyle={{ paddingTop: '25px' }} />
            <Bar yAxisId="right" dataKey="totalRainfall" name="Total Rainfall" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Area yAxisId="left" type="monotone" dataKey="avgTemp" name="Avg Temperature" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 7 }} />
        </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-3 tracking-tight"><Cloud className="w-9 h-9 text-emerald-600" /> {T.weatherCenter?.[language] || 'Weather Center'}</h1>
            <div className="font-semibold text-xl text-gray-500 dark:text-gray-400">{selectedCity}, India</div>
        </div>
        
        {alerts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/50 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-4 rounded-r-lg flex items-start gap-4 shadow-sm">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold">{T.alertTitle?.[language] || 'Extreme Heatwave Warning'}</h3>
                    <p className="text-sm">{T.alertAdvice?.[language] || 'Apply light and frequent irrigation. Use shade nets.'}</p>
                </div>
            </div>
        )}
        
        {loading && <div className="h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl"><p>{translations.common.loading?.[language] || 'Loading...'}</p></div>}
        {error && <div className="h-72 flex items-center justify-center bg-rose-50 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 rounded-2xl p-4">{error}</div>}

        {!loading && weatherData && (
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full mix-blend-overlay"></div>
                 <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/20 rounded-full mix-blend-overlay"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-2xl font-light">{T.currentTemp?.[language] || 'Current Temperature'}</p>
                            <p className="text-8xl font-bold tracking-tighter -ml-1">{Math.round(weatherData.main.temp)}°C</p>
                        </div>
                        <div className="text-right">
                            <img src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="weather" className="w-32 h-32 -mt-8 -mr-8 drop-shadow-lg"/>
                            <p className="text-xl text-emerald-100 capitalize">{weatherData.weather[0].description}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center"><p className="text-sm">{T.feelsLike?.[language] || 'Feels Like'}</p><p className="font-bold text-xl">{Math.round(weatherData.main.feels_like)}°C</p></div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center"><p className="text-sm">{T.humidity?.[language] || 'Humidity'}</p><p className="font-bold text-xl">{weatherData.main.humidity}%</p></div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center"><p className="text-sm">{T.windSpeed?.[language] || 'Wind Speed'}</p><p className="font-bold text-xl">{weatherData.wind.speed}m/s</p></div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3"><Calendar className="w-8 h-8 text-emerald-600" />{T.historicalWeather?.[language] || 'Historical Analysis'}</h2>
                <div className="flex items-center p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-full border dark:border-gray-700">
                    {[{id: 'days'}, {id: 'weeks'}, {id: 'months'}, {id: 'years'}].map((tf) => (
                        <button key={tf.id} onClick={() => setHistoricalTimeframe(tf.id as any)} 
                                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${historicalTimeframe === tf.id ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {T[tf.id]?.[language] || tf.id.charAt(0).toUpperCase() + tf.id.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-96 w-full">
              {loadingHistorical ? <div className="flex items-center justify-center h-full"><p>{translations.common.loading?.[language] || 'Loading...'}</p></div> : renderHistoricalChart()}
            </div>
        </div>
    </div>
  );
};

export default WeatherPage;