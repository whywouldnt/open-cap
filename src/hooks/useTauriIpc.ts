import { useState, useCallback, useEffect } from 'react';
import { Project } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';

export interface DeviceCapabilities {
  platform: string;
  arch: string;
  hardwareAccelerated: boolean;
  supportedEncoders: string[];
  maxPreviewResolution: string;
  maxFps: number;
  isMobile: boolean;
}

export interface SaveResult {
  success: boolean;
  filePath: string;
  fileSize: number;
  savedAt: string;
}

// Check if running inside Tauri webview
const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export function useTauriIpc() {
  const [isTauri, setIsTauri] = useState(false);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { project, setProject } = useProjectStore();

  useEffect(() => {
    setIsTauri(isTauriEnv());
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    if (isTauriEnv()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const caps = await invoke<DeviceCapabilities>('get_device_capabilities');
        setCapabilities(caps);
      } catch (err) {
        console.warn('Tauri IPC capabilities query failed:', err);
      }
    } else {
      // Mock browser fallback
      setCapabilities({
        platform: 'Web/Mobile Emulation',
        arch: 'wasm/x86_64',
        hardwareAccelerated: true,
        supportedEncoders: ['WebCodecs H.264', 'WebCodecs VP9', 'WebCodecs AV1'],
        maxPreviewResolution: '1080x1920',
        maxFps: 60,
        isMobile: true,
      });
    }
  };

  const saveCurrentProject = useCallback(
    async (customPath?: string): Promise<SaveResult | null> => {
      setIsLoading(true);
      setStatusMessage('Kaydediliyor...');

      try {
        if (isTauriEnv()) {
          const { invoke } = await import('@tauri-apps/api/core');
          const result = await invoke<SaveResult>('save_project', {
            path: customPath || null,
            project,
          });
          setStatusMessage(`Proje kaydedildi: ${result.filePath}`);
          setTimeout(() => setStatusMessage(null), 3000);
          return result;
        } else {
          // Browser LocalStorage fallback
          const storageKey = `opencap_project_${project.id}`;
          const json = JSON.stringify(project, null, 2);
          localStorage.setItem(storageKey, json);
          localStorage.setItem('opencap_last_project', project.id);

          const result: SaveResult = {
            success: true,
            filePath: `localStorage://${storageKey}`,
            fileSize: new Blob([json]).size,
            savedAt: new Date().toISOString(),
          };
          setStatusMessage('Proje tarayıcı belleğine (.opencap) kaydedildi!');
          setTimeout(() => setStatusMessage(null), 3000);
          return result;
        }
      } catch (err) {
        console.error('Save failed:', err);
        setStatusMessage(`Kayıt hatası: ${String(err)}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [project]
  );

  const loadProjectFromFile = useCallback(
    async (filePath: string): Promise<boolean> => {
      setIsLoading(true);
      setStatusMessage('Proje yükleniyor...');

      try {
        if (isTauriEnv()) {
          const { invoke } = await import('@tauri-apps/api/core');
          const loadedProject = await invoke<Project>('load_project', { path: filePath });
          setProject(loadedProject);
          setStatusMessage(`Proje yüklendi: ${loadedProject.name}`);
          setTimeout(() => setStatusMessage(null), 3000);
          return true;
        } else {
          // Check localStorage
          const json = localStorage.getItem(filePath.replace('localStorage://', ''));
          if (json) {
            const loaded = JSON.parse(json) as Project;
            setProject(loaded);
            setStatusMessage(`Proje yüklendi: ${loaded.name}`);
            setTimeout(() => setStatusMessage(null), 3000);
            return true;
          }
          throw new Error('Proje dosyası bulunamadı');
        }
      } catch (err) {
        console.error('Load failed:', err);
        setStatusMessage(`Yükleme hatası: ${String(err)}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setProject]
  );

  return {
    isTauri,
    capabilities,
    isLoading,
    statusMessage,
    saveCurrentProject,
    loadProjectFromFile,
  };
}
