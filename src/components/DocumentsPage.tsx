import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Heart, 
  Trash2, 
  Download, 
  Eye, 
  Folder, 
  Tag, 
  Check, 
  X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentItem } from '../types';

export const DocumentsPage: React.FC = () => {
  const { documents, addDocument, deleteDocument, toggleDocumentFavorite, openAddModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['all', 'Heshiisyo', 'Waxbarasho', 'Caafimaad', 'Shakhsi', 'Maaliyadda'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const fileUrl = reader.result as string;
      addDocument({
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        fileUrl: fileUrl,
        category: 'Shakhsi',
        tags: ['Soo geliyay', 'Dukumiinti'],
        isFavorite: false,
        summary: `Dukumiinti nooca ${file.type || 'file'} ah oo la soo galiyay.`
      });
    };

    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const fileUrl = reader.result as string;
        addDocument({
          title: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
          fileUrl: fileUrl,
          category: 'Shakhsi',
          tags: ['Soo geliyay', 'Dukumiinti'],
          isFavorite: false,
          summary: `Dukumiinti nooca ${file.type || 'file'} ah oo la soo galiyay.`
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Dukumiintiyadaada (Documents)</h2>
          <p className="text-[14px] text-[#718096] mt-0.5">
            Keydi, maamul, oo baaro heshiisyadaada, shahaadooyinkaaga iyo waraaqaha muhiimka ah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-full border border-[#1a202c] bg-white text-[#1a202c] hover:bg-[#f7f6f0] text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
          >
            <Upload className="w-4 h-4" />
            <span>Soo Geli File</span>
          </button>
          <button
            onClick={() => openAddModal('document')}
            className="px-4 py-2.5 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ku dar Dukumiinti</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]' 
            : 'border-[#ece9df] bg-white hover:bg-[#fbf9f0] hover:border-emerald-700/30'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#def7ee] text-[#0e382b] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-[15px] text-[#1a202c]">
          Halkan ku soo tuur ama guji si aad u soo geliso dukumiinti
        </h4>
        <p className="text-[12.5px] text-[#718096] mt-1">
          Waxaa la taageerayaa PDF, DOCX, TXT, PNG, JPG (Ilaa 25MB)
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0e382b] text-white shadow-xs'
                  : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
              }`}
            >
              {cat === 'all' ? 'Dhammaan' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi dukumiinti..."
            className="w-full bg-white border border-[#ece9df] rounded-full pl-10 pr-4 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f0ede0] flex items-center justify-center text-[#718096] mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">Weli ma jiraan dukumiintiyo qeybtan ku jira</h4>
            <p className="text-[13px] text-[#718096] max-w-sm mx-auto">
              Soo geli ama ku dar dukumiintigaaga si aad halkan ugu aragto.
            </p>
            <button
              onClick={() => openAddModal('document')}
              className="px-4 py-2 rounded-full bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
            >
              Ku dar Dukumiinti
            </button>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-[#ece9df] shadow-2xs hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleDocumentFavorite(doc.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        doc.isFavorite ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-gray-50'
                      }`}
                      title={doc.isFavorite ? 'Ka saar favorites' : 'Ku dar favorites'}
                    >
                      <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Ma hubtaa inaad tirtirto "${doc.title}"?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Tirtir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-[15px] text-[#1a202c] mt-3 group-hover:text-[#0e382b] transition-colors line-clamp-1">
                  {doc.title}
                </h4>

                <p className="text-[12.5px] text-[#5a6578] mt-1 line-clamp-2 leading-relaxed">
                  {doc.summary || doc.fileName}
                </p>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] text-[#718096] bg-[#fbf9f0] border border-[#ece9df] px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#f0ede0] flex items-center justify-between text-[12px] text-[#718096]">
                <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="text-[#0e382b] font-semibold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Fiiri</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ece9df] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede0]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#0e382b]" />
                <h3 className="font-bold text-[16px] text-[#1a202c] truncate max-w-[300px]">
                  {previewDoc.title}
                </h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[13.5px]">
              <div>
                <span className="font-semibold text-gray-700">Magaca File-ka:</span>{' '}
                <span className="text-gray-600">{previewDoc.fileName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Qeybta (Category):</span>{' '}
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">
                  {previewDoc.category}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Baaxadda:</span>{' '}
                <span className="text-gray-600">{(previewDoc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Taariikhda la geliyay:</span>{' '}
                <span className="text-gray-600">{new Date(previewDoc.uploadedAt).toLocaleDateString('so-SO')}</span>
              </div>

              {previewDoc.summary && (
                <div className="p-3 bg-[#fbf9f0] border border-[#f0ede0] rounded-xl text-gray-700 leading-relaxed text-[13px]">
                  <strong>Dulmar:</strong> {previewDoc.summary}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  alert(`Soo dejinta ${previewDoc.fileName} waa diyaar!`);
                }}
                className="px-4 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21] flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Soo Dejiso (Download)</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-50"
              >
                Xir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
