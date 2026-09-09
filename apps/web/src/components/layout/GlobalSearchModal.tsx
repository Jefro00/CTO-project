import React, { useState, useEffect } from 'react';
import { Search, Car, User, FileText, Wrench, X, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { GlobalSearchResult } from '@automotive-os/types';
import Link from 'next/link';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const { api } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.globalSearch(query);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, api]);

  if (!isSearchOpen) return null;

  const hasResults =
    results &&
    (results.vehicles.length > 0 ||
      results.customers.length > 0 ||
      results.workOrders.length > 0 ||
      results.documents.length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeSearch} />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div
          className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="relative flex items-center border-b border-slate-200 px-4">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Поиск по VIN, госномеру, марке, клиенту, телефону, заказу #..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block ml-3 px-2 py-0.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Search Content */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {isLoading && (
              <div className="text-center py-8 text-sm text-slate-500">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mr-2" />
                Ищем данные...
              </div>
            )}

            {!isLoading && query && !hasResults && (
              <div className="text-center py-10 text-slate-500">
                <Car className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">По запросу &quot;{query}&quot; ничего не найдено</p>
                <p className="text-xs text-slate-400 mt-1">Проверьте правильность написания VIN, номера или фамилии</p>
              </div>
            )}

            {!isLoading && !query && (
              <div className="py-4 text-center text-xs text-slate-400">
                Введите поисковый запрос (VIN, номер автомобиля, имя клиента или номер заказа)
              </div>
            )}

            {results && hasResults && (
              <>
                {/* Vehicles */}
                {results.vehicles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-indigo-600" /> Автомобили ({results.vehicles.length})
                    </h4>
                    <div className="space-y-1">
                      {results.vehicles.map((v) => (
                        <Link
                          key={v.id}
                          href={`/vehicles/${v.id}`}
                          onClick={closeSearch}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-1 rounded">
                              {v.license_plate}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                                {v.make} {v.model} <span className="text-xs font-normal text-slate-500">({v.year})</span>
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                VIN: {v.vin} • Владелец: {v.customer?.first_name} {v.customer?.last_name}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers */}
                {results.customers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Клиенты ({results.customers.length})
                    </h4>
                    <div className="space-y-1">
                      {results.customers.map((c) => (
                        <Link
                          key={c.id}
                          href={`/customers/${c.id}`}
                          onClick={closeSearch}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600">
                              {c.first_name} {c.last_name}
                            </p>
                            <p className="text-xs text-slate-500">{c.phone} {c.email ? `• ${c.email}` : ''}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Orders */}
                {results.workOrders.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" /> Заказ-наряды ({results.workOrders.length})
                    </h4>
                    <div className="space-y-1">
                      {results.workOrders.map((w) => (
                        <Link
                          key={w.id}
                          href={`/work-orders/${w.id}`}
                          onClick={closeSearch}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-amber-600">
                              Заказ-наряд #{w.number} — <span className="font-semibold text-indigo-600">{w.total.toLocaleString('ru-RU')} ₽</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {w.vehicle?.make} {w.vehicle?.model} ({w.vehicle?.license_plate}) • {w.customer?.first_name} {w.customer?.last_name}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {results.documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600" /> Документы ({results.documents.length})
                    </h4>
                    <div className="space-y-1">
                      {results.documents.map((d) => (
                        <Link
                          key={d.id}
                          href={`/documents`}
                          onClick={closeSearch}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600">{d.name}</p>
                            <p className="text-xs text-slate-500 uppercase">{d.type} • {d.is_signed ? 'Подписан' : 'Черновик'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
