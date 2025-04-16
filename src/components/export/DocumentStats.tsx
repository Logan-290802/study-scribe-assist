
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Reference } from '@/components/ai';

interface DocumentStatsProps {
  documentContent: string;
  references: Reference[];
  includeAiHistory: boolean;
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
}

const DocumentStats: React.FC<DocumentStatsProps> = ({
  documentContent,
  references,
  includeAiHistory,
  aiChatHistory,
}) => {
  return (
    <div className="bg-gray-50 rounded-md p-3 text-sm">
      <h4 className="font-medium mb-1">Export will include:</h4>
      <ul className="space-y-1">
        <li className="flex items-center gap-1 text-gray-600">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Document Content ({documentContent.length > 0 ? 'Non-empty' : 'Empty'})
        </li>
        <li className="flex items-center gap-1 text-gray-600">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Bibliography ({references.length} references)
        </li>
        {includeAiHistory && (
          <li className="flex items-center gap-1 text-gray-600">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            AI Chat History ({aiChatHistory.length} messages)
          </li>
        )}
      </ul>
    </div>
  );
};

export default DocumentStats;
