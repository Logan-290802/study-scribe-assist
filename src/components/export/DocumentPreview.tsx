
import React from 'react';
import { Card } from '@/components/ui/card';
import { Reference } from '@/components/ai';

interface DocumentPreviewProps {
  title: string;
  content: string;
  references: Reference[];
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
  studentName?: string;
  courseInfo?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  title,
  content,
  references,
  aiChatHistory,
  studentName = 'Student Name',
  courseInfo = 'Course Information'
}) => {
  const submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm border rounded-lg">
      {/* Cover Page */}
      <div className="p-8 border-b">
        <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
        <div className="space-y-4 text-center">
          <p className="text-lg">{studentName}</p>
          <p className="text-lg">{courseInfo}</p>
          <p className="text-lg">{submissionDate}</p>
          <p className="text-sm text-gray-600 italic mt-8">
            This submission includes AI-assisted components for transparency and review.
          </p>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-8 border-b">
        <h2 className="text-2xl font-semibold mb-6">Document Content</h2>
        <div 
          className="prose prose-sm sm:prose lg:prose-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* References */}
      <div className="p-8 border-b">
        <h2 className="text-2xl font-semibold mb-6">References</h2>
        <ul className="space-y-3">
          {references.map((ref) => (
            <li key={ref.id} className="text-sm text-gray-700">
              {ref.authors.join(', ')} ({ref.year}). <em>{ref.title}</em>. {ref.source}.
              {ref.url && <span> Retrieved from <a href={ref.url} className="text-blue-600 hover:underline">{ref.url}</a></span>}
            </li>
          ))}
        </ul>
      </div>

      {/* AI Interaction Log */}
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-6">AI Interaction Log</h2>
        <div className="space-y-4">
          {aiChatHistory.map((msg, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-medium">[{msg.role === 'user' ? 'User' : 'AI'}]:</span>
              <span className="text-gray-700 ml-2">{msg.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
