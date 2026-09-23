import { useState } from 'react';
import { ShoppingCart, Package, Volume2, Loader2 } from 'lucide-react';
import type { Product } from '../lib/types';
import { api } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, isAdmin }: ProductCardProps) {
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleListen = async () => {
    setAudioLoading(true);
    setAudioError(null);
    setAudioUrl(null);
    try {
      const { audioUrl: url } = await api.getVoice(product.productId, 'es');
      const audio = new Audio(url);
      audio.play().catch(() => {
        setAudioUrl(url);
      });
    } catch (err) {
      setAudioError(err instanceof Error ? `Error: ${err.message}` : 'No se pudo generar el audio.');
    } finally {
      setAudioLoading(false);
    }
  };

  const displayDescription = product.aiDescription || product.description;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.aiAltText || product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {displayDescription}
        </p>
        {product.aiDescription && (
          <span className="text-xs text-purple-600 mb-2 inline-block">✨ Descripción generada con IA</span>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>{product.stock} disponibles</span>
          </div>
        </div>

        <button
          onClick={handleListen}
          disabled={audioLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 mb-3 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
        >
          {audioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          Escuchar descripción
        </button>
        {audioError && <p className="text-red-500 text-xs mb-2">{audioError}</p>}
        {audioUrl && (
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 text-xs mb-2 underline block"
          >
            ▶ El navegador bloqueó la reproducción automática. Clic aquí para escuchar.
          </a>
        )}

        {isAdmin ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete?.(product.productId)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <button
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </button>
        )}
      </div>
    </div>
  );
}
