
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

type SaveFunction<T> = (data: T) => Promise<void>;

interface UseAutosaveOptions {
  debounceTime?: number;
  onSaveStart?: () => void;
  onSaveEnd?: (success: boolean) => void;
}

export function useAutosave<T>(
  data: T,
  saveFunction: SaveFunction<T>,
  deps: any[] = [],
  options: UseAutosaveOptions = {}
) {
  const {
    debounceTime = 2000,
    onSaveStart,
    onSaveEnd
  } = options;
  
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<T>(data);
  const pendingSaveRef = useRef<T | null>(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Data change handler with debounce
  useEffect(() => {
    // Skip initial render or unnecessary saves
    if (JSON.stringify(data) === JSON.stringify(lastSavedDataRef.current)) {
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Save function to execute after debounce
    const saveData = async () => {
      if (isSavingRef.current) {
        // If already saving, store for later
        pendingSaveRef.current = data;
        return;
      }
      
      try {
        isSavingRef.current = true;
        if (onSaveStart) onSaveStart();
        
        await saveFunction(data);
        
        lastSavedDataRef.current = data;
        
        if (onSaveEnd) onSaveEnd(true);
        
        // Check if there's a pending save
        if (pendingSaveRef.current) {
          const pendingData = pendingSaveRef.current;
          pendingSaveRef.current = null;
          isSavingRef.current = false;
          
          // Start a new save with the latest data
          timeoutRef.current = setTimeout(() => {
            saveData();
          }, 100);
        } else {
          isSavingRef.current = false;
        }
      } catch (error) {
        console.error('Error autosaving data:', error);
        if (onSaveEnd) onSaveEnd(false);
        isSavingRef.current = false;
        
        toast({
          title: "Autosave Failed",
          description: "Changes couldn't be saved automatically. Please try saving manually.",
          variant: "destructive",
        });
      }
    };
    
    // Set the timeout for debounced save
    timeoutRef.current = setTimeout(saveData, debounceTime);
    
  }, [data, saveFunction, debounceTime, toast, ...deps]);
  
  return {
    isSaving: isSavingRef.current,
    lastSavedData: lastSavedDataRef.current,
    // Manual save function
    save: async () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (isSavingRef.current) {
        return;
      }
      
      try {
        isSavingRef.current = true;
        if (onSaveStart) onSaveStart();
        
        await saveFunction(data);
        
        lastSavedDataRef.current = data;
        
        if (onSaveEnd) onSaveEnd(true);
        isSavingRef.current = false;
        
        toast({
          title: "Saved",
          description: "Your changes have been saved.",
        });
      } catch (error) {
        console.error('Error saving data manually:', error);
        if (onSaveEnd) onSaveEnd(false);
        isSavingRef.current = false;
        
        toast({
          title: "Save Failed",
          description: "Changes couldn't be saved. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
}
