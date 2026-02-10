import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { contagemService } from '@/services/contagem.service';
import type { CreateContagemRequest, Produto, QueuedContagem, SyncStatus } from '@/types/api';

const STORAGE_KEY = '@contagem_queue_failed';
const MAX_CONCURRENT = 3;
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 5;

let localIdCounter = 0;

function generateLocalId(): string {
  return `local_${Date.now()}_${++localIdCounter}`;
}

export function useContagemQueue() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ inflight: 0, failed: 0 });
  const failedQueueRef = useRef<QueuedContagem[]>([]);
  const inflightCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateSyncStatus = useCallback(() => {
    setSyncStatus({
      inflight: inflightCountRef.current,
      failed: failedQueueRef.current.length,
    });
  }, []);

  const persistFailed = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(failedQueueRef.current));
    } catch {
      // silent
    }
  }, []);

  const addToFailedQueue = useCallback((item: QueuedContagem) => {
    item.status = 'failed';
    failedQueueRef.current.push(item);
    updateSyncStatus();
    persistFailed();
  }, [updateSyncStatus, persistFailed]);

  const sendContagem = useCallback(async (item: QueuedContagem): Promise<boolean> => {
    try {
      inflightCountRef.current++;
      updateSyncStatus();
      await contagemService.criar(item.request);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      const isValidationError = message.includes('400') || message.includes('validação');
      item.errorMessage = message;
      item.retryCount++;

      if (isValidationError || item.retryCount >= MAX_RETRIES) {
        addToFailedQueue(item);
      } else {
        addToFailedQueue(item);
      }
      return false;
    } finally {
      inflightCountRef.current--;
      updateSyncStatus();
    }
  }, [updateSyncStatus, addToFailedQueue]);

  const fireAndForget = useCallback((request: CreateContagemRequest, produto: Produto) => {
    const item: QueuedContagem = {
      localId: generateLocalId(),
      request,
      produto,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'syncing',
    };

    // Fire immediately, don't await
    sendContagem(item);
  }, [sendContagem]);

  const retryFailed = useCallback(async () => {
    const toRetry = failedQueueRef.current.filter(
      (item) => item.retryCount < MAX_RETRIES,
    );

    if (toRetry.length === 0) return;

    // Remove items being retried from the failed queue
    failedQueueRef.current = failedQueueRef.current.filter(
      (item) => item.retryCount >= MAX_RETRIES,
    );
    updateSyncStatus();
    persistFailed();

    // Process with concurrency limit
    const chunks: QueuedContagem[][] = [];
    for (let i = 0; i < toRetry.length; i += MAX_CONCURRENT) {
      chunks.push(toRetry.slice(i, i + MAX_CONCURRENT));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map((item) => sendContagem(item)));
    }
  }, [sendContagem, updateSyncStatus, persistFailed]);

  const flushNow = useCallback(async (): Promise<void> => {
    // Wait for inflight to finish
    const waitForInflight = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (inflightCountRef.current === 0) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });

    await waitForInflight();

    // Retry all failed items
    const toRetry = [...failedQueueRef.current];
    failedQueueRef.current = [];
    updateSyncStatus();

    if (toRetry.length > 0) {
      const chunks: QueuedContagem[][] = [];
      for (let i = 0; i < toRetry.length; i += MAX_CONCURRENT) {
        chunks.push(toRetry.slice(i, i + MAX_CONCURRENT));
      }

      for (const chunk of chunks) {
        await Promise.all(chunk.map((item) => sendContagem(item)));
      }
    }

    await waitForInflight();
    await persistFailed();
  }, [sendContagem, updateSyncStatus, persistFailed]);

  // Restore failed items from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const items: QueuedContagem[] = JSON.parse(stored);
          if (items.length > 0) {
            failedQueueRef.current = items;
            updateSyncStatus();
            console.log(`[ContagemQueue] ${items.length} itens restaurados do storage`);
          }
        }
      } catch {
        // silent
      }
    })();
  }, [updateSyncStatus]);

  // Auto-retry timer
  useEffect(() => {
    retryTimerRef.current = setInterval(() => {
      const retryable = failedQueueRef.current.filter(
        (item) => item.retryCount < MAX_RETRIES,
      );
      if (retryable.length > 0) {
        retryFailed();
      }
    }, RETRY_INTERVAL);

    return () => {
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
      }
    };
  }, [retryFailed]);

  return {
    fireAndForget,
    syncStatus,
    flushNow,
    retryFailed,
  };
}
