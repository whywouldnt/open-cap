/**
 * OPEN-CAP In-App Auto Updater Engine (GitHub Releases OTA)
 * Checks for new releases directly from GitHub without needing Google Play Store.
 * Fetches release notes, compares semver, and triggers 1-tap APK update & installation.
 */

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  apkDownloadUrl: string;
  publishedAt: string;
  fileSizeBytes?: number;
  sha256?: string;
}

export class AutoUpdaterEngine {
  public static CURRENT_VERSION = '1.0.0';

  // Configurable GitHub Repository info (can be updated with user's github repo)
  private static GITHUB_OWNER = 'whywouldnt';
  private static GITHUB_REPO = 'open-cap';

  public static setRepository(owner: string, repo: string) {
    this.GITHUB_OWNER = owner;
    this.GITHUB_REPO = repo;
  }

  /**
   * Compares two semantic version strings (e.g. "1.0.1" > "1.0.0")
   */
  public static isNewerVersion(remote: string, current: string): boolean {
    const cleanRemote = remote.replace(/^v/, '').trim();
    const cleanCurrent = current.replace(/^v/, '').trim();

    const remoteParts = cleanRemote.split('.').map((n) => parseInt(n, 10) || 0);
    const currentParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

    for (let i = 0; i < Math.max(remoteParts.length, currentParts.length); i++) {
      const r = remoteParts[i] || 0;
      const c = currentParts[i] || 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  }

  /**
   * Checks GitHub Releases API for the latest available APK release
   */
  public static async checkForUpdates(
    customRepo?: { owner: string; repo: string }
  ): Promise<UpdateInfo> {
    const owner = customRepo?.owner || this.GITHUB_OWNER;
    const repo = customRepo?.repo || this.GITHUB_REPO;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        // If repo is private or not found yet, provide simulated mock data for local testing
        if (response.status === 404) {
          console.info('GitHub release not published yet or private repository.');
        }
        return {
          hasUpdate: false,
          currentVersion: this.CURRENT_VERSION,
          latestVersion: this.CURRENT_VERSION,
          releaseName: 'En Güncel Sürümdesiniz',
          releaseNotes: 'Uygulamanız şu anda en son sürümdedir.',
          apkDownloadUrl: '',
          publishedAt: new Date().toISOString(),
        };
      }

      const releaseData = await response.json();
      const tagName = (releaseData.tag_name || releaseData.name || '').replace(/^v/, '');
      const hasNewVersion = this.isNewerVersion(tagName, this.CURRENT_VERSION);

      // Find the APK file and checksum inside release assets
      let apkUrl = '';
      let apkSize = 0;
      let sha256 = '';

      if (Array.isArray(releaseData.assets)) {
        const apkAsset = releaseData.assets.find(
          (a: any) =>
            a.name &&
            (a.name.endsWith('.apk') || a.name.includes('release') || a.name.includes('app'))
        );
        if (apkAsset) {
          apkUrl = apkAsset.browser_download_url;
          apkSize = apkAsset.size;
        }

        const shaAsset = releaseData.assets.find(
          (a: any) => a.name && (a.name.endsWith('.sha256') || a.name.includes('checksum') || a.name.includes('SHA256'))
        );
        if (shaAsset) {
          sha256 = shaAsset.browser_download_url;
        }
      }

      if (!apkUrl) {
        apkUrl = releaseData.html_url || '';
      }

      return {
        hasUpdate: hasNewVersion,
        currentVersion: this.CURRENT_VERSION,
        latestVersion: tagName || this.CURRENT_VERSION,
        releaseName: releaseData.name || `OPEN-CAP v${tagName}`,
        releaseNotes: releaseData.body || 'Yeni performans iyileştirmeleri ve hata düzeltmeleri.',
        apkDownloadUrl: apkUrl,
        publishedAt: releaseData.published_at || new Date().toISOString(),
        fileSizeBytes: apkSize,
        sha256,
      };
    } catch (err) {
      console.warn('Could not check for updates from GitHub:', err);
      return {
        hasUpdate: false,
        currentVersion: this.CURRENT_VERSION,
        latestVersion: this.CURRENT_VERSION,
        releaseName: 'Güncelleme Kontrolü Yapılamadı',
        releaseNotes: 'İnternet bağlantınızı kontrol edin.',
        apkDownloadUrl: '',
        publishedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Triggers download and installation of the new APK
   */
  public static startApkDownload(apkUrl: string) {
    if (!apkUrl) return;
    // On mobile web/Tauri, opening APK URL triggers browser or OS Package Installer
    window.open(apkUrl, '_blank');
  }
}
