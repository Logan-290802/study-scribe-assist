
import { Document } from '@/types/document.types';
import { useDocumentCreate } from './document/useDocumentCreate';
import { useDocumentUpdate } from './document/useDocumentUpdate';
import { useDocumentDelete } from './document/useDocumentDelete';
import { useDocumentArchive } from './document/useDocumentArchive';

export const useDocumentOperations = (
  userId: string | undefined,
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  trackNewDocumentId?: (id: string) => void
) => {
  const { addDocument, isCreating } = useDocumentCreate(userId, setDocuments, trackNewDocumentId);
  const { updateDocument, isUpdating } = useDocumentUpdate(userId, setDocuments);
  const { deleteDocument, isDeleting } = useDocumentDelete(userId, setDocuments);
  const { archiveDocument, isArchiving } = useDocumentArchive(userId, setDocuments);

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  return {
    addDocument,
    updateDocument,
    getDocument,
    deleteDocument,
    archiveDocument,
    isOperationInProgress: isCreating || isUpdating || isDeleting || isArchiving
  };
};
