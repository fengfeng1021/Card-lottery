import { ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import { FileUp, PlusCircle, Repeat, Scale, Trash2, X } from 'lucide-react';
import { PrizeItem, PrizePool } from '../types';
import { generateId } from '../lib/id';
import Modal from './Modal';

interface CreatePoolModalProps {
  isOpen: boolean;
  editingPool: PrizePool | null;
  onClose: () => void;
  onSave: (pool: PrizePool) => void;
  onDelete: (poolId: string) => void;
}

const THEMES = [
  { color: '#00fbfb', gradientTo: '#fe00fe' },
  { color: '#ffabf3', gradientTo: '#e9ddff' },
  { color: '#e9ddff', gradientTo: '#3a4a49' },
  { color: '#007070', gradientTo: '#00dddd' },
  { color: '#fe00fe', gradientTo: '#380038' },
];

const createItem = (name = ''): PrizeItem => ({
  id: generateId(),
  name,
  probability: 0,
});

const normalizeTextLine = (line: string) =>
  line
    .replace(/^\s*[-*+]\s+/, '')
    .replace(/^\s*\d+[.)]\s+/, '')
    .replace(/^\s*#{1,6}\s+/, '')
    .replace(/^\s*>\s+/, '')
    .replace(/^\s*-\s+\[[ xX]\]\s+/, '')
    .trim();

const itemsFromUnknown = (value: unknown): PrizeItem[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') return normalizeTextLine(entry);
        if (typeof entry === 'object' && entry !== null && 'name' in entry) {
          return normalizeTextLine(String((entry as { name?: unknown }).name ?? ''));
        }
        if (typeof entry === 'object' && entry !== null && 'title' in entry) {
          return normalizeTextLine(String((entry as { title?: unknown }).title ?? ''));
        }
        return '';
      })
      .filter(Boolean)
      .map((name) => createItem(name));
  }

  if (typeof value === 'object' && value !== null && 'items' in value) {
    return itemsFromUnknown((value as { items?: unknown }).items);
  }

  return [];
};

const parseImportedItems = (text: string): PrizeItem[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const jsonItems = itemsFromUnknown(JSON.parse(trimmed));
    if (jsonItems.length) return jsonItems;
  } catch {
    // Plain text and Markdown imports intentionally fall through here.
  }

  return trimmed
    .split(/\r?\n/)
    .map(normalizeTextLine)
    .filter(Boolean)
    .map((name) => createItem(name));
};

export default function CreatePoolModal({
  isOpen,
  editingPool,
  onClose,
  onSave,
  onDelete,
}: CreatePoolModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState('');
  const [isEqualProbability, setIsEqualProbability] = useState(true);
  const [allowRepeat, setAllowRepeat] = useState(true);
  const [items, setItems] = useState<PrizeItem[]>(() => [createItem(), createItem()]);
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');
  const itemInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingPool !== null;

  useEffect(() => {
    if (!isOpen) return;

    if (editingPool) {
      setTitle(editingPool.title);
      setItems(
        editingPool.items.map((item) => ({
          ...item,
          probability: item.probability ?? 0,
        })),
      );
      setIsEqualProbability(!editingPool.items.some((item) => (item.probability ?? 0) > 0));
      setAllowRepeat(editingPool.allowRepeat);
    } else {
      setTitle('');
      setItems([createItem(), createItem()]);
      setIsEqualProbability(true);
      setAllowRepeat(true);
    }

    setImportText('');
    setError('');
  }, [editingPool, isOpen]);

  const focusItem = (id: string) => {
    window.requestAnimationFrame(() => itemInputRefs.current[id]?.focus());
  };

  const handleAddItem = () => {
    const nextItem = createItem();
    setItems((currentItems) => [...currentItems, nextItem]);
    focusItem(nextItem.id);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof PrizeItem, value: string | number) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const importItems = (text: string) => {
    const importedItems = parseImportedItems(text);

    if (!importedItems.length) {
      setError('沒有找到可匯入的獎項。');
      return;
    }

    setItems((currentItems) => {
      const meaningfulItems = currentItems.filter((item) => item.name.trim());
      return meaningfulItems.length ? [...meaningfulItems, ...importedItems] : importedItems;
    });
    setImportText('');
    setError('');
    focusItem(importedItems[0].id);
  };

  const handleImportText = () => importItems(importText);

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      importItems(String(reader.result ?? ''));
      event.target.value = '';
    };
    reader.onerror = () => {
      setError('檔案讀取失敗，請改用貼上文字匯入。');
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    const cleanItems = items
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        probability: isEqualProbability ? undefined : Number(item.probability) || 0,
      }))
      .filter((item) => item.name);

    if (!title.trim() || cleanItems.length === 0) {
      setError('請填寫獎池名稱和至少一個獎項。');
      return;
    }

    const theme = editingPool ?? THEMES[Math.floor(Math.random() * THEMES.length)];

    onSave({
      id: editingPool?.id ?? generateId(),
      title: title.trim(),
      color: theme.color,
      gradientTo: theme.gradientTo,
      items: cleanItems,
      allowRepeat,
      ...(editingPool?.drawnItemIds ? { drawnItemIds: editingPool.drawnItemIds } : {}),
    });

    onClose();
  };

  const handleDeletePool = () => {
    if (!editingPool) return;
    onDelete(editingPool.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledById={titleId} panelClassName="pool-modal-panel">
      <div className="pool-modal bg-[#121212] border border-[#333333] rounded-xl w-full max-w-2xl p-6 cyber-glow relative overflow-y-auto">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-fixed" />

        <div className="flex justify-between items-center mb-6">
          <h3 id={titleId} className="font-headline-md text-2xl text-white">
            {isEditing ? '編輯獎池' : '建立獎池'}
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors"
            aria-label="關閉"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor={`${titleId}-name`} className="font-label-sm text-xs text-primary-fixed">
                獎池名稱 <span className="text-error">*</span>
              </label>
              <input
                id={`${titleId}-name`}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full bg-[#0B0B0B] cyber-border rounded-md px-4 py-3 text-white placeholder:text-white/40 cyber-focus transition-all"
                placeholder="輸入獎池名稱..."
              />
            </div>

            <div className="flex items-center justify-between bg-surface-container p-3 rounded-md border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <Scale className="text-outline" size={20} />
                <span className="text-white">相同機率</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEqualProbability}
                  onChange={(event) => setIsEqualProbability(event.target.checked)}
                  aria-label="相同機率"
                />
                <div className="w-11 h-6 bg-surface-bright peer-focus-visible:ring-2 peer-focus-visible:ring-primary-fixed rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>

            <div className="flex items-center justify-between bg-surface-container p-3 rounded-md border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <Repeat className="text-outline" size={20} />
                <div>
                  <span className="text-white">可重複中獎</span>
                  <p className="text-xs text-on-surface-variant">關閉後，中獎者不再被抽中</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={allowRepeat}
                  onChange={(event) => setAllowRepeat(event.target.checked)}
                  aria-label="可重複中獎"
                />
                <div className="w-11 h-6 bg-surface-bright peer-focus-visible:ring-2 peer-focus-visible:ring-primary-fixed rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-xs text-primary-fixed">獎池項目</span>
                <button
                  onClick={handleAddItem}
                  className="text-xs text-secondary hover:text-secondary-container transition-colors flex items-center gap-1"
                >
                  <PlusCircle size={16} /> 新增
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      ref={(element) => {
                        itemInputRefs.current[item.id] = element;
                      }}
                      type="text"
                      value={item.name}
                      onChange={(event) => handleUpdateItem(item.id, 'name', event.target.value)}
                      className="min-w-0 flex-grow bg-[#0B0B0B] cyber-border rounded-md px-3 py-2 text-white placeholder:text-white/40 cyber-focus"
                      placeholder="項目名稱"
                      aria-label={`獎項 ${index + 1} 名稱`}
                    />
                    {!isEqualProbability && (
                      <input
                        type="number"
                        min="0"
                        value={item.probability || ''}
                        onChange={(event) =>
                          handleUpdateItem(item.id, 'probability', Number(event.target.value))
                        }
                        className="w-20 bg-[#0B0B0B] cyber-border rounded-md px-2 py-2 text-white text-center cyber-focus"
                        placeholder="%"
                        aria-label={`獎項 ${index + 1} 權重`}
                      />
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`刪除獎項 ${index + 1}`}
                      title="刪除獎項"
                      className="text-outline-variant hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-primary-fixed">匯入獎項</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-secondary hover:text-secondary-container transition-colors flex items-center gap-1"
              >
                <FileUp size={16} /> 選擇檔案
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.md,text/plain,application/json,text/markdown"
              onChange={handleImportFile}
              className="hidden"
            />
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="w-full min-h-40 bg-[#0B0B0B] cyber-border rounded-md px-3 py-2 text-white placeholder:text-white/40 cyber-focus resize-none"
              placeholder={'第一項獎品\n第二項獎品\n第三項獎品'}
              aria-label="匯入獎項文字"
            />
            <button
              type="button"
              onClick={handleImportText}
              className="w-full border border-secondary text-secondary hover:bg-secondary hover:text-black font-semibold py-2 rounded-md transition-all active:scale-[0.98]"
            >
              從文字匯入
            </button>
            {error && (
              <p className="text-error text-sm leading-relaxed" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          {isEditing ? (
            <button
              onClick={handleDeletePool}
              className="border border-error text-error hover:bg-error hover:text-black font-semibold py-3 px-5 rounded-md transition-all active:scale-[0.98]"
            >
              刪除獎池
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-primary-fixed hover:bg-primary-fixed-dim disabled:opacity-50 disabled:hover:bg-primary-fixed text-black font-semibold text-lg py-3 px-8 rounded-md transition-all cyber-glow active:scale-[0.98]"
          >
            {isEditing ? '儲存獎池' : '建立獎池'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
