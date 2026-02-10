import { Plus, Edit, Trash2, CheckSquare } from 'lucide-react';
import { MarketingProduct } from '../../../types';

type MarketingTabProps = {
  products: MarketingProduct[];
  onNewProduct: () => void;
  onEditProduct: (product: MarketingProduct) => void;
  onDeleteProduct: (id: string) => void;
  onCopyLink: (code: string) => void;
};

export function MarketingTab({
  products,
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  onCopyLink,
}: MarketingTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Produtos de Marketing</h2>
        <button
          onClick={onNewProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    /{product.public_code}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : product.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status === 'active' ? 'Ativo' : product.status === 'suspended' ? 'Suspenso' : 'Rascunho'}
                  </span>
                  {product.quality_score !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-black border ${
                      product.quality_score >= 80 ? 'bg-green-50 text-green-600 border-green-200' : 
                      product.quality_score >= 50 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      Score: {product.quality_score}%
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
                {product.subtitle && (
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{product.subtitle}</p>
                )}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => onCopyLink(product.public_code)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Copiar Link Público"
                >
                  <CheckSquare size={18} />
                </button>
                <button
                  onClick={() => onEditProduct(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {product.description}
            </p>

            <div className="flex items-center gap-2">
               {product.image_urls && product.image_urls.length > 0 && (
                  <div className="flex -space-x-2">
                    {product.image_urls.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm" alt="" />
                    ))}
                    {product.image_urls.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        +{product.image_urls.length - 3}
                      </div>
                    )}
                  </div>
               )}
               <span className="text-[10px] text-gray-400">
                 Categoria: {product.category}
               </span>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhum produto de marketing cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
