
import React, { useState } from 'react';
import { Reference } from '../ai/AiChat';
import { Library, Plus, X, Copy, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferenceManagerProps {
  references: Reference[];
  onAddReference: (reference: Reference) => void;
  onDeleteReference: (id: string) => void;
}

export const ReferenceManager: React.FC<ReferenceManagerProps> = ({
  references,
  onAddReference,
  onDeleteReference,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const toggleReferenceDetails = (id: string) => {
    setActiveReferenceId(activeReferenceId === id ? null : id);
  };

  const handleAddManualReference = () => {
    // In a real app, this would open a form
    const newReference: Reference = {
      id: Date.now().toString(),
      title: "Manual Reference Example",
      authors: ["Smith, J.", "Johnson, A."],
      year: "2022",
      source: "Journal of Example Studies, 15(2), 123-145",
      format: "APA",
    };
    
    onAddReference(newReference);
  };

  const copyReferenceToClipboard = (reference: Reference) => {
    let formattedRef = '';
    
    switch (reference.format) {
      case 'APA':
        formattedRef = `${reference.authors.join(', ')} (${reference.year}). ${reference.title}. ${reference.source}.`;
        break;
      case 'MLA':
        formattedRef = `${reference.authors.join(', ')}. "${reference.title}." ${reference.source}, ${reference.year}.`;
        break;
      case 'Harvard':
        formattedRef = `${reference.authors.join(', ')} ${reference.year}, '${reference.title}', ${reference.source}.`;
        break;
    }
    
    navigator.clipboard.writeText(formattedRef)
      .then(() => {
        // In a real app, this would show a toast
        console.log('Reference copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy reference: ', err);
      });
  };

  return (
    <div className="border rounded-md overflow-hidden glass-card animate-fade-in mt-4">
      <div 
        className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">References</h3>
          <span className="text-sm text-gray-500">({references.length})</span>
        </div>
        <button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="max-h-[300px] overflow-y-auto thin-scrollbar">
            {references.length === 0 ? (
              <div className="p-4 text-center text-gray-500 italic">
                No references added yet
              </div>
            ) : (
              <ul className="divide-y">
                {references.map(reference => (
                  <li key={reference.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div 
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleReferenceDetails(reference.id)}
                    >
                      <div>
                        <div className="font-medium text-blue-700">{reference.title}</div>
                        <div className="text-sm text-gray-600">
                          {formatAuthors(reference.authors)}, {reference.year}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyReferenceToClipboard(reference);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                          title="Copy citation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReference(reference.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                          title="Delete reference"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {activeReferenceId === reference.id && (
                      <div className="mt-2 pl-2 border-l-2 border-blue-200 text-sm text-gray-600 animate-slide-in">
                        <div className="mb-1">
                          <span className="font-medium">Source:</span> {reference.source}
                        </div>
                        {reference.url && (
                          <div className="mb-1">
                            <span className="font-medium">URL:</span> <a href={reference.url} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{reference.url}</a>
                          </div>
                        )}
                        <div className="mb-1">
                          <span className="font-medium">Format:</span> {reference.format}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t bg-gray-50">
            <button
              onClick={handleAddManualReference}
              className="w-full py-1.5 flex justify-center items-center gap-1 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Reference Manually
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferenceManager;
