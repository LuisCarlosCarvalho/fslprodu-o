import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';

interface ElementorWidget {
  id: string;
  elType: 'widget';
  widgetType: string;
  settings: any;
}

interface ElementorColumn {
  id: string;
  elType: 'column';
  elements: (ElementorWidget | ElementorSection)[];
  settings: any;
}

interface ElementorSection {
  id: string;
  elType: 'section';
  elements: ElementorColumn[];
  settings: any;
}

export function TemplateDemoPage() {
  const { filename } = useParams<{ filename: string }>();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/templates/${filename}`);
        if (!response.ok) throw new Error('Template não encontrado');
        const data = await response.json();
        setTemplate(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filename) fetchTemplate();
  }, [filename]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar o modelo</h1>
        <p className="text-slate-400 mb-8">{error || 'Modelo não encontrado'}</p>
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Portfólio
        </button>
      </div>
    );
  }

  const renderWidget = (widget: ElementorWidget) => {
    const { widgetType, settings } = widget;

    switch (widgetType) {
      case 'heading':
        const Tag = (settings.header_size || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <Tag 
            className="font-bold mb-4" 
            style={{ 
              color: settings.title_color,
              textAlign: settings.align || 'left',
              fontSize: settings.typography_font_size?.size ? `${settings.typography_font_size.size}px` : undefined
            }}
            dangerouslySetInnerHTML={{ __html: settings.title }}
          />
        );
      
      case 'text-editor':
        return (
          <div 
            className="prose prose-invert max-w-none mb-4"
            style={{ 
              color: settings.text_color,
              textAlign: settings.align || 'left'
            }}
            dangerouslySetInnerHTML={{ __html: settings.editor }}
          />
        );

      case 'image':
        return (
          <div className="mb-4" style={{ textAlign: settings.align || 'center' }}>
            <img 
              src={settings.image?.url} 
              alt="Widget Image" 
              className="max-w-full h-auto rounded-lg inline-block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Imagem+da+Demo';
              }}
            />
          </div>
        );

      case 'button':
        return (
          <div className="mb-4" style={{ textAlign: settings.align || 'center' }}>
            <button 
              className="px-8 py-4 rounded-full font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: settings.background_color || '#3b82f6',
                color: settings.button_text_color || '#ffffff'
              }}
            >
              {settings.text}
            </button>
          </div>
        );

      case 'video':
        return (
          <div className="aspect-video mb-6 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
            <p className="text-slate-400">Vídeo Placeholder ({settings.youtube_url || settings.link})</p>
          </div>
        );

      case 'spacer':
        return <div style={{ height: settings.space?.size || 50 }} />;

      default:
        return null;
    }
  };

  const renderColumn = (column: ElementorColumn) => {
    return (
      <div 
        key={column.id}
        className="flex-1 px-4"
        style={{ 
          width: column.settings._column_size ? `${column.settings._column_size}%` : '100%' 
        }}
      >
        {column.elements.map(el => el.elType === 'widget' ? renderWidget(el) : renderSection(el))}
      </div>
    );
  };

  const renderSection = (section: ElementorSection) => {
    const bgStyle: React.CSSProperties = {
      backgroundColor: section.settings.background_color,
      backgroundImage: section.settings.background_image?.url ? `url(${section.settings.background_image.url})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '80px 0'
    };

    return (
      <section key={section.id} style={bgStyle} className="relative">
        <div className="container mx-auto px-4 flex flex-wrap">
          {section.elements.map(renderColumn)}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 overflow-x-hidden">
      {/* Simulation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/portfolio')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Sair da demonstração"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-xl font-black text-blue-600 tracking-tighter uppercase leading-none">
            PRÉVIA
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`p-2 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Tablet View"
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
           <span className="hidden md:inline text-xs text-slate-400 mr-4">Preview do Modelo de Página</span>
           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
             Comprar Template
           </button>
        </div>
      </div>

      {/* Main Content Render Area */}
      <div className="pt-24 pb-12 flex justify-center bg-[#f8f9fa] min-h-screen">
        <div 
          className={`bg-white shadow-2xl transition-all duration-500 ease-in-out border border-gray-200 rounded-t-xl overflow-hidden ${
            viewMode === 'desktop' ? 'w-full' : 
            viewMode === 'tablet' ? 'w-[768px]' : 
            'w-[375px]'
          }`}
          style={{ height: 'fit-content', minHeight: 'calc(100vh - 150px)' }}
        >
          {template.content?.map((section: any) => renderSection(section))}
          
          {/* Footer Disclaimer Inside Frame */}
          <footer className="bg-slate-900 text-white py-12 px-6 text-center border-t border-slate-800">
             <p className="text-slate-400 text-sm">
               &copy; {new Date().getFullYear()} FSL Solution. Este é um preview demonstrativo do modelo de página.
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
