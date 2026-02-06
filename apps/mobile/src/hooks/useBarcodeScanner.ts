import { useCallback, useRef, useState } from 'react';
import { TextInput, Keyboard } from 'react-native';

interface UseBarcodeScanner {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  isManualMode: boolean;
  isProcessing: boolean;
  focusInput: () => void;
  toggleManualMode: () => void;
  setIsProcessing: (v: boolean) => void;
  clear: () => void;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  showSoftInputOnFocus: boolean;
}

interface Options {
  onScan: (barcode: string) => void | Promise<void>;
  debounceMs?: number;
}

export function useBarcodeScanner({ onScan, debounceMs = 150 }: Options): UseBarcodeScanner {
  const inputRef = useRef<TextInput | null>(null);
  const [value, setValue] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanTime = useRef(0);
  const valueRef = useRef('');

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  }, []);

  const clear = useCallback(() => {
    setValue('');
    valueRef.current = '';
    focusInput();
  }, [focusInput]);

  const onChangeText = useCallback((text: string) => {
    setValue(text);
    valueRef.current = text;
  }, []);

  const onSubmitEditing = useCallback(() => {
    const now = Date.now();
    if (now - lastScanTime.current < debounceMs) {
      clear();
      return;
    }

    // Use ref instead of state to get the latest value
    const trimmed = valueRef.current.trim();
    if (!trimmed || isProcessing) {
      clear();
      return;
    }

    lastScanTime.current = now;
    setIsProcessing(true);

    Promise.resolve(onScan(trimmed)).finally(() => {
      setIsProcessing(false);
      clear();
    });
  }, [isProcessing, debounceMs, onScan, clear]);

  const toggleManualMode = useCallback(() => {
    setIsManualMode((prev) => {
      const next = !prev;
      if (next) {
        inputRef.current?.focus();
      } else {
        Keyboard.dismiss();
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return next;
    });
  }, []);

  return {
    inputRef,
    value,
    isManualMode,
    isProcessing,
    focusInput,
    toggleManualMode,
    setIsProcessing,
    clear,
    onChangeText,
    onSubmitEditing,
    showSoftInputOnFocus: isManualMode,
  };
}
