import { useEffect, useId, useMemo, useState } from 'react';
import { History, Trash2, X } from 'lucide-react';
import { DrawRecord } from '../types';
import Modal from './Modal';

interface HistoryModalProps {
  isOpen: boolean;
  records: DrawRecord[];
  onClose: () => void;
  onClearAll: () => void;
  onDeleteRecord: (id: string) => void;
}

const timeFormatter = new Intl.DateTimeFormat('zh-TW', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export default function HistoryModal({
  isOpen,
  records,
  onClose,
  onClearAll,
  onDeleteRecord,
}: HistoryModalProps) {
  const titleId = useId();
  const [filterPoolId, setFilterPoolId] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Re-arm the two-step clear guard and reset the filter each time the modal is (re)opened.
  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      setFilterPoolId('all');
    }
  }, [isOpen]);

  // Pools present in history, most-recent first, for the filter dropdown.
  const poolOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const record of records) {
      if (!seen.has(record.poolId)) seen.set(record.poolId, record.poolTitle);
    }
    return Array.from(seen, ([id, title]) => ({ id, title }));
  }, [records]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => b.timestamp - a.timestamp),
    [records],
  );

  const filtered = useMemo(
    () => (filterPoolId === 'all' ? sorted : sorted.filter((r) => r.poolId === filterPoolId)),
    [sorted, filterPoolId],
  );

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearAll();
    setConfirmClear(false);
    setFilterPoolId('all');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledById={titleId} panelClassName="history-modal-panel">
      <div className="history-modal bg-[#121212] border border-[#333] rounded-2xl w-full max-w-lg p-6 relative overflow-hidden cyber-glow">
        <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History className="text-secondary" size={22} />
            <h3 id={titleId} className="font-headline-md text-2xl text-white">
              抽獎記錄
            </h3>
            <span className="text-xs text-on-surface-variant font-label-sm">({records.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors"
            aria-label="關閉"
          >
            <X size={24} />
          </button>
        </div>

        {records.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4">
            <select
              value={filterPoolId}
              onChange={(event) => setFilterPoolId(event.target.value)}
              className="min-w-0 flex-1 bg-[#0B0B0B] cyber-border rounded-md px-3 py-2 text-sm text-white cyber-focus"
              aria-label="依獎池篩選"
            >
              <option value="all">全部獎池</option>
              {poolOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleClear}
              className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm transition-all active:scale-[0.98] ${
                confirmClear
                  ? 'border-error bg-error text-black font-bold'
                  : 'border-error/60 text-error hover:bg-error hover:text-black'
              }`}
            >
              <Trash2 size={15} /> {confirmClear ? '確定清除？' : '清除全部'}
            </button>
          </div>
        )}

        <div className="history-list max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-on-surface-variant">
              {records.length === 0 ? '還沒有任何抽獎記錄。' : '此獎池沒有記錄。'}
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((record) => (
                <li key={record.id} className="history-row group">
                  <span
                    className="history-dot"
                    style={{ background: `linear-gradient(145deg, ${record.color}, ${record.gradientTo})` }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{record.itemName}</p>
                    <p className="truncate text-xs text-on-surface-variant">{record.poolTitle}</p>
                  </div>
                  <time className="shrink-0 font-label-sm text-xs text-outline" dateTime={new Date(record.timestamp).toISOString()}>
                    {timeFormatter.format(record.timestamp)}
                  </time>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    className="shrink-0 text-outline-variant hover:text-error transition-colors opacity-70 hover:opacity-100"
                    aria-label={`刪除 ${record.itemName} 的記錄`}
                    title="刪除此記錄"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
