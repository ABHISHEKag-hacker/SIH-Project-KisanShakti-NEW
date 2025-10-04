// src/pages/FarmTrackingPage.tsx

import React, { useState, useEffect } from 'react';
import { Map, Plus, Edit, Trash2, Lightbulb, Save, X, Bell, Cpu, Power, Droplets } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// ---------------- Interfaces ----------------
interface Reminder {
  id: number;
  text: string;
  dueDate: string;
  completed: boolean;
}

interface Plot {
  id: number;
  name: string;
  size: number;
  crop: string;
  suggestion: string;
  reminders: Reminder[];
  color: string;
}

interface SoilReportHistory {
  id: string;
  fileName: string;
  soilData: any[];
  recommendations: any[];
  createdAt?: any;
}

interface Device {
  id: string;
  name: string;
  type: 'Sprinkler' | 'Sensor' | 'Pump' | 'Other';
  status: 'on' | 'off';
  plotId?: number; // Optional: Link device to a specific plot
}

interface FarmTrackingPageProps {
  currentUser: any;
}

// ---------------- Component ----------------
const FarmTrackingPage: React.FC<FarmTrackingPageProps> = ({ currentUser }) => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlot, setCurrentPlot] = useState<Partial<Plot> | null>(null);
  const [totalLandSize, setTotalLandSize] = useState<number>(0);
  const [history, setHistory] = useState<SoilReportHistory[]>([]);
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Partial<Device> | null>(null);

  // Load total land size from user profile
  useEffect(() => {
    if (currentUser?.farmerProfile?.landSize) {
      setTotalLandSize(parseFloat(currentUser.farmerProfile.landSize));
    }
  }, [currentUser]);

  // Load plots from Firestore
  useEffect(() => {
    const fetchPlots = async () => {
      if (!currentUser?.uid) return;
      // Corrected collection path
      const plotsRef = collection(db, 'users', currentUser.uid, 'plots');
      const snapshot = await getDocs(plotsRef);
      const fetchedPlots: Plot[] = snapshot.docs.map(d => ({
        id: parseInt(d.id),
        ...(d.data() as Omit<Plot, 'id'>),
      }));
      setPlots(fetchedPlots);
    };
    fetchPlots();
  }, [currentUser]);

  // Load soil report history
  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "soilReports"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const reports: SoilReportHistory[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SoilReportHistory[];

      setHistory(reports);
    };

    fetchHistory();
  }, []);
  
  // Load devices from Firestore
  useEffect(() => {
    const fetchDevices = async () => {
      if (!currentUser?.uid) return;
      // Corrected collection path
      const devicesRef = collection(db, 'users', currentUser.uid, 'devices');
      const snapshot = await getDocs(devicesRef);
      const fetchedDevices: Device[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Device, 'id'>),
      }));
      setDevices(fetchedDevices);
    };
    fetchDevices();
  }, [currentUser]);

  // ---------------- Helpers ----------------
  const getAISuggestion = (crop: string): string => {
    const suggestions: { [key: string]: string } = {
      tomato: 'After tomatoes, plant legumes like beans or peas to restore nitrogen in the soil.',
      potato: 'Avoid planting tomatoes or eggplants next, as they are in the same family and can share diseases. Consider leafy greens.',
      wheat: 'Planting a legume crop like chickpeas or lentils after wheat can help fix nitrogen.',
      cotton: 'Rotate with a non-host crop for pests like sorghum or corn to break the pest cycle.',
      default: 'Consider planting a cover crop like clover to improve soil health for the next season.',
    };
    return suggestions[crop.toLowerCase()] || suggestions.default;
  };

  const getReminderSuggestions = (crop: string): Partial<Reminder>[] => {
    const suggestions: { [key: string]: Partial<Reminder>[] } = {
      tomato: [
        { text: 'Check for pests like hornworms', dueDate: '2025-09-28' },
        { text: 'Apply calcium nitrate fertilizer', dueDate: '2025-10-05' },
      ],
      potato: [
        { text: 'Hill the potato plants to protect tubers', dueDate: '2025-10-01' },
        { text: 'Scout for late blight after rainfall', dueDate: '2025-10-10' },
      ],
      default: [
        { text: 'Check soil moisture levels', dueDate: '2025-09-26' },
      ],
    };
    return suggestions[crop.toLowerCase()] || suggestions.default;
  };

  const getCropIcon = (crop: string) => {
    const c = crop.toLowerCase();
    if (c.includes('tomato')) return '🍅';
    if (c.includes('potato')) return '🥔';
    if (c.includes('wheat')) return '🌾';
    if (c.includes('cotton')) return '🌱';
    if (c.includes('corn')) return '🌽';
    return '🌱';
  };

  const getPlotColor = (crop: string): string => {
    const colors: { [key: string]: string } = {
      tomato: '#ef4444',
      potato: '#f97316',
      wheat: '#f59e0b',
      cotton: '#ecfdf5',
      corn: '#eab308',
      soybean: '#22c55e',
      sugarcane: '#84cc16',
      default: '#3b82f6',
    };
    return colors[crop.toLowerCase()] || colors.default;
  };
  
  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
        case 'Sprinkler':
            return <Droplets className="w-8 h-8 text-blue-500" />;
        case 'Sensor':
            return <Cpu className="w-8 h-8 text-purple-500" />;
        case 'Pump':
            return <Power className="w-8 h-8 text-yellow-500" />;
        default:
            return <Cpu className="w-8 h-8 text-gray-500" />;
    }
  };

  // ---------------- Handlers ----------------
  const handleOpenModal = (plot: Partial<Plot> | null = null) => {
    setCurrentPlot(plot ? { ...plot } : { name: '', size: 0, crop: '', reminders: [] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlot(null);
  };

  const handleSavePlot = async () => {
    if (!currentPlot || !currentPlot.name || !currentPlot.size || !currentPlot.crop) {
      alert('Please fill all fields.');
      return;
    }

    const currentTotalSize = plots.reduce((sum, p) => sum + (p.id === currentPlot.id ? 0 : p.size), 0);
    const newTotalSize = currentTotalSize + (currentPlot.size || 0);

    if (newTotalSize > totalLandSize) {
      alert(`You cannot add more than your total land size of ${totalLandSize} acres.`);
      return;
    }

    const suggestion = getAISuggestion(currentPlot.crop);
    const color = getPlotColor(currentPlot.crop);

    let newPlot: Plot;
    if (currentPlot.id) {
      newPlot = { ...plots.find(p => p.id === currentPlot.id)!, ...currentPlot, suggestion, color } as Plot;
    } else {
      newPlot = {
        id: plots.length > 0 ? Math.max(...plots.map(p => p.id)) + 1 : 1,
        name: currentPlot.name!,
        size: currentPlot.size!,
        crop: currentPlot.crop!,
        suggestion,
        reminders: currentPlot.reminders || [],
        color,
      };
    }

    try {
      // Corrected collection path
      const plotRef = doc(db, 'users', currentUser.uid, 'plots', newPlot.id.toString());
      await setDoc(plotRef, newPlot, { merge: true });

      setPlots(prev => {
        const exists = prev.find(p => p.id === newPlot.id);
        return exists ? prev.map(p => (p.id === newPlot.id ? newPlot : p)) : [...prev, newPlot];
      });

      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save plot.');
    }
  };

  const handleDeletePlot = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this plot?')) return;

    try {
      // Corrected collection path
      await deleteDoc(doc(db, 'users', currentUser.uid, 'plots', id.toString()));
      setPlots(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete plot.');
    }
  };

  const handleReminderChange = (reminder: Partial<Reminder>) => {
    if (!currentPlot) return;
    const reminders = currentPlot.reminders || [];
    if (reminder.id) {
      setCurrentPlot({
        ...currentPlot,
        reminders: reminders.map(r => r.id === reminder.id ? { ...r, ...reminder } as Reminder : r),
      });
    } else {
      const newReminder: Reminder = {
        id: Date.now(),
        text: reminder.text || '',
        dueDate: reminder.dueDate || '',
        completed: false,
      };
      setCurrentPlot({ ...currentPlot, reminders: [...reminders, newReminder] });
    }
  };

  const handleDeleteReminder = (id: number) => {
    if (!currentPlot) return;
    setCurrentPlot({
      ...currentPlot,
      reminders: (currentPlot.reminders || []).filter(r => r.id !== id),
    });
  };

  const handleOpenDeviceModal = (device: Partial<Device> | null = null) => {
    setCurrentDevice(device ? { ...device } : { name: '', type: 'Sprinkler', status: 'off' });
    setIsDeviceModalOpen(true);
  };
  
  const handleCloseDeviceModal = () => {
    setIsDeviceModalOpen(false);
    setCurrentDevice(null);
  };
  
  const handleSaveDevice = async () => {
    if (!currentUser?.uid) {
        alert('You must be logged in to save a device.');
        return;
    }

    if (!currentDevice || !currentDevice.name || !currentDevice.type) {
        alert('Please fill all device fields.');
        return;
    }
  
    const newDevice: Omit<Device, 'plotId'> & { plotId?: number } = {
        id: currentDevice.id || uuidv4(),
        name: currentDevice.name,
        type: currentDevice.type || 'Other',
        status: currentDevice.status || 'off',
    };
  
    if (currentDevice.plotId) {
        newDevice.plotId = currentDevice.plotId;
    }
  
    try {
        // Corrected collection path
        const deviceRef = doc(db, 'users', currentUser.uid, 'devices', newDevice.id);
        await setDoc(deviceRef, newDevice, { merge: true });
  
        setDevices(prev => {
            const updatedDevice = { ...newDevice, id: newDevice.id } as Device;
            const exists = prev.find(d => d.id === updatedDevice.id);
            return exists ? prev.map(d => (d.id === updatedDevice.id ? updatedDevice : d)) : [...prev, updatedDevice];
        });
  
        handleCloseDeviceModal();
    } catch (err: any) {
        console.error("Firestore save error:", err); 
        alert(`Failed to save device. Error: ${err.message}`);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;

    try {
        // Corrected collection path
        await deleteDoc(doc(db, 'users', currentUser.uid, 'devices', id));
        setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
        console.error(err);
        alert('Failed to delete device.');
    }
  };
  
  const handleToggleDeviceStatus = async (device: Device) => {
    const newStatus = device.status === 'on' ? 'off' : 'on';
    // Corrected collection path
    const deviceRef = doc(db, 'users', currentUser.uid, 'devices', device.id);
    
    try {
        await updateDoc(deviceRef, { status: newStatus });
        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: newStatus } : d));
    } catch (err) {
        console.error("Failed to toggle device status:", err);
        alert("Failed to update device status.");
    }
  };

  // ---------------- Render ----------------
  const allocatedSize = plots.reduce((sum, p) => sum + p.size, 0);
  const allocationPercentage = totalLandSize > 0 ? (allocatedSize / totalLandSize) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Farm Tracking Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3 mb-4 md:mb-0">
            <Map className="w-8 h-8 text-green-600" />
            My Farm Tracking
          </h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Plot
          </button>
        </div>

        {/* Land Allocation Progress */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Land Allocation</h3>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{allocatedSize.toFixed(1)} / {totalLandSize} acres used</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${allocationPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Farm Layout */}
        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Farm Layout</h3>
          <div className="w-full h-32 md:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg flex overflow-hidden border dark:border-gray-600">
            {plots.map(plot => (
              <div
                key={plot.id}
                className="h-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  width: `${(plot.size / totalLandSize) * 100}%`,
                  backgroundColor: plot.color,
                }}
                title={`${plot.name} - ${plot.crop} (${plot.size} acres)`}
              >
                <span className="text-2xl drop-shadow-md">{getCropIcon(plot.crop)}</span>
              </div>
            ))}
            {allocatedSize < totalLandSize && (
              <div
                className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm"
                style={{ width: `${((totalLandSize - allocatedSize) / totalLandSize) * 100}%` }}
              >
                Unused
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
            {plots.map(plot => (
              <div key={plot.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plot.color }}></div>
                <span>{plot.name} ({plot.crop})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plots Grid */}
        {plots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map(plot => {
              const upcomingReminder = plot.reminders.filter(r => !r.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
              return (
                <div key={plot.id} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-shadow hover:shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{plot.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plot.size} acre(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(plot)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeletePlot(plot.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow space-y-2 text-sm text-gray-700 dark:text-gray-200 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getCropIcon(plot.crop)}</span>
                      <div>
                        <p className="font-semibold">Current Crop</p>
                        <p className="text-gray-600 dark:text-gray-300">{plot.crop}</p>
                      </div>
                    </div>
                  </div>

                  {upcomingReminder && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 mb-4 rounded-r-md">
                      <div className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                        <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-xs">Next Reminder:</p>
                          <p className="text-xs">{upcomingReminder.text} - {new Date(upcomingReminder.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-3 mt-auto">
                    <div className="flex items-start gap-3 text-green-800 dark:text-green-200">
                      <Lightbulb className="w-5 h-5 flex-shrink-0 mt-1 text-green-600 dark:text-green-400" />
                      <div>
                        <h4 className="font-semibold text-sm">AI Suggestion</h4>
                        <p className="text-xs text-green-700 dark:text-green-300">{plot.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <Map className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Your farm is empty!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first plot of land.</p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Plot
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Plot Modal */}
      {isModalOpen && currentPlot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {currentPlot.id ? 'Edit Plot' : 'Add New Plot'}
              </h2>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Name</label>
                  <input
                    type="text"
                    placeholder="e.g., North Field"
                    value={currentPlot.name || ''}
                    onChange={(e) => setCurrentPlot({ ...currentPlot, name: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Size (in acres)</label>
                  <input
                    type="number"
                    placeholder="e.g., 1.5"
                    value={currentPlot.size || ''}
                    onChange={(e) => setCurrentPlot({ ...currentPlot, size: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Crop</label>
                  <input
                    type="text"
                    placeholder="e.g., Tomato"
                    value={currentPlot.crop || ''}
                    onChange={(e) => setCurrentPlot({ ...currentPlot, crop: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {/* Reminders Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Reminders</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    {(currentPlot.reminders || []).map(reminder => (
                      <div key={reminder.id} className="flex items-center gap-2 bg-white dark:bg-gray-700 p-2 rounded shadow-sm">
                        <input type="checkbox" checked={reminder.completed} onChange={() => handleReminderChange({ ...reminder, completed: !reminder.completed })} className="form-checkbox h-5 w-5 text-green-600 rounded" />
                        <input type="text" value={reminder.text} onChange={e => handleReminderChange({ ...reminder, text: e.target.value })} className="flex-grow p-1 border-b bg-transparent" />
                        <input type="date" value={reminder.dueDate} onChange={e => handleReminderChange({ ...reminder, dueDate: e.target.value })} className="p-1 border-b bg-transparent" />
                        <button onClick={() => handleDeleteReminder(reminder.id)}><Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" /></button>
                      </div>
                    ))}
                    {(currentPlot.reminders || []).length === 0 && <p className="text-center text-sm text-gray-500 py-4">No reminders yet.</p>}
                  </div>
                  <div className="mt-2 space-x-4">
                    <button onClick={() => handleReminderChange({ text: 'New Reminder', dueDate: new Date().toISOString().split('T')[0] })} className="text-sm font-semibold text-blue-600 hover:text-blue-500">Add Reminder</button>
                    <button onClick={() => {
                      const suggestions = getReminderSuggestions(currentPlot.crop || '');
                      suggestions.forEach(s => handleReminderChange(s));
                    }} className="text-sm font-semibold text-green-600 hover:text-green-500">Get AI Suggestions</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t dark:border-gray-700">
              <button onClick={handleCloseModal} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSavePlot} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soil Report History Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Soil Report History
        </h2>
        <div className="space-y-4">
          {history.length > 0 ? history.map((report) => (
            <div key={report.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-300">📄 {report.fileName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {report.createdAt?.toDate().toLocaleString()}
              </p>
              <h3 className="font-semibold mt-2">Nutrients:</h3>
              <ul className="text-sm list-disc list-inside">
                {report.soilData.map((item, i) => (
                  <li key={i}>{item.nutrient}: {item.value} (Ideal: {item.ideal})</li>
                ))}
              </ul>
              <h3 className="font-semibold mt-2">Recommendations:</h3>
              <ul className="text-sm list-disc list-inside">
                {report.recommendations.map((rec, i) => (
                  <li key={i}>{rec.title} - {rec.priority}</li>
                ))}
              </ul>
            </div>
          )) : (
            <p className="text-sm text-gray-500">No soil reports found.</p>
          )}
        </div>
      </div>
      
      {/* Device Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3 mb-4 md:mb-0">
                  <Cpu className="w-7 h-7 text-blue-600" />
                  Device Management
              </h2>
              <button
                  onClick={() => handleOpenDeviceModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                  <Plus className="w-5 h-5" />
                  Add New Device
              </button>
          </div>

          {devices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devices.map(device => (
                      <div key={device.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border dark:border-gray-700 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                                {getDeviceIcon(device.type)}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenDeviceModal(device)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteDevice(device.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{device.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type: {device.type}</p>
                            {device.plotId && plots.find(p => p.id === device.plotId) && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  📍 Linked to: <span className="font-semibold">{plots.find(p => p.id === device.plotId)?.name}</span>
                                </p>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <button
                                onClick={() => handleToggleDeviceStatus(device)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-white ${device.status === 'on' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                            >
                                <Power className="w-5 h-5" />
                                <span>Turn {device.status === 'on' ? 'Off' : 'On'}</span>
                            </button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <Cpu className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No devices found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first smart device to control it from here.</p>
                  <button
                      onClick={() => handleOpenDeviceModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                      <Plus className="w-5 h-5" />
                      Add New Device
                  </button>
              </div>
          )}
      </div>

      {/* Add/Edit Device Modal */}
      {isDeviceModalOpen && currentDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {currentDevice.id ? 'Edit Device' : 'Add New Device'}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device Name</label>
                  <input
                    type="text"
                    placeholder="e.g., North Field Sprinkler"
                    value={currentDevice.name || ''}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, name: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device Type</label>
                  <select
                    value={currentDevice.type || 'Sprinkler'}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, type: e.target.value as Device['type'] })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option>Sprinkler</option>
                    <option>Sensor</option>
                    <option>Pump</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link to Plot (Optional)</label>
                  <select
                    value={currentDevice.plotId || ''}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, plotId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">No linked plot</option>
                    {plots.map(plot => (
                      <option key={plot.id} value={plot.id}>{plot.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t dark:border-gray-700">
              <button onClick={handleCloseDeviceModal} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSaveDevice} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="w-4 h-4" /> Save Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmTrackingPage;