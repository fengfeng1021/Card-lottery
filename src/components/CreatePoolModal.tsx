import { motion, AnimatePresence } from 'motion/react';
import { X, PlusCircle, Scale, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PrizePool, PrizeItem } from '../types';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (pool: PrizePool) => void;
}

export default function CreatePoolModal({ isOpen, onClose, onCreate }: CreatePoolModalProps) {
  const [title, setTitle] = useState('');
  const [isEqualProbability, setIsEqualProbability] = useState(true);
  const [items, setItems] = useState<PrizeItem[]>([
    { id: '1', name: '', probability: 0 },
    { id: '2', name: '', probability: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), name: '', probability: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof PrizeItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = () => {
    if (!title.trim() || items.some(i => !i.name.trim())) return;
    
    // Choose random thematic colors
    const themes = [
      { color: '#00fbfb', gradientTo: '#fe00fe' },
      { color: '#ffabf3', gradientTo: '#e9ddff' },
      { color: '#e9ddff', gradientTo: '#3a4a49' },
      { color: '#007070', gradientTo: '#00dddd' },
      { color: '#fe00fe', gradientTo: '#380038' },
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    onCreate({
      id: Math.random().toString(),
      title,
      color: theme.color,
      gradientTo: theme.gradientTo,
      items: items.filter(i => i.name.trim())
    });
    
    setTitle('');
    setItems([{ id: '1', name: '', probability: 0 }]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border border-[#333333] rounded-xl w-full max-w-md p-6 cyber-glow relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-fixed"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-2xl text-white">建立獎池</h3>
              <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-sm text-xs text-primary-fixed">獎池名稱 <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0B0B] cyber-border rounded-md px-4 py-3 text-white placeholder:text-outline-variant cyber-focus transition-all"
                  placeholder="輸入獎池名稱..."
                />
              </div>

              <div className="flex items-center justify-between bg-surface-container p-3 rounded-md border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <Scale className="text-outline" size={20} />
                  <span className="text-white">一致機率</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isEqualProbability}
                    onChange={(e) => setIsEqualProbability(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-bright peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-xs text-primary-fixed">獎池項目</label>
                  <button onClick={handleAddItem} className="text-xs text-secondary hover:text-secondary-container transition-colors flex items-center gap-1">
                    <PlusCircle size={16} /> 新增
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="flex-grow bg-[#0B0B0B] cyber-border rounded-md px-3 py-2 text-white placeholder:text-outline-variant cyber-focus"
                        placeholder="項目名稱"
                      />
                      {!isEqualProbability && (
                        <input 
                          type="number" 
                          value={item.probability || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'probability', parseFloat(e.target.value))}
                          className="w-16 bg-[#0B0B0B] cyber-border rounded-md px-2 py-2 text-white text-center cyber-focus"
                          placeholder="%"
                        />
                      )}
                      <button onClick={() => handleRemoveItem(item.id)} className="text-outline-variant hover:text-error transition-colors p-1">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full bg-primary-fixed hover:bg-primary-fixed-dim disabled:opacity-50 disabled:hover:bg-primary-fixed text-black font-semibold text-lg py-3 rounded-md transition-all cyber-glow mt-4 active:scale-[0.98]"
              >
                建立獎池
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
