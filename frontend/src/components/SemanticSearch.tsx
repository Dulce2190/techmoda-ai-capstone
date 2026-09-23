import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { SearchResult } from '../lib/api';

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.semanticSearch(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Búsqueda inteligente</h3>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
          IA · Bedrock
        </span>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ej: "algo abrigado para el frío" o "regalo elegante"'
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Buscar
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {results && (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No se encontraron productos relevantes.</p>
          ) : (
            <ul className="space-y-2">
              {results.map((r) => (
                <li
                  key={r.productId}
                  className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-lg text-sm"
                >
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <span className="flex items-center gap-3 text-gray-600">
                    <span>${r.price.toFixed(2)}</span>
                    <span className="text-xs text-purple-600">
                      relevancia {(r.score * 100).toFixed(0)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
