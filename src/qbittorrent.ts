import axios, { AxiosInstance } from 'axios';

export interface TorrentInfo {
  name: string;
  hash: string;
  state: string;
  total_size: number;
  progress: number;
  dl_speed: number;
  up_speed: number;
  eta: number;
  category: string;
  tags: string[];
  added_on: number;
  completion_on: number;
  save_path: string;
}

export interface AppState {
  dl_info_speed: number;
  dl_info_data: number;
  up_info_speed: number;
  up_info_data: number;
  dht_nodes: number;
  connection_status: string;
  queueing: boolean;
  use_alt_speed_limits: boolean;
  server_state: string;
}

export interface TorrentAddOptions {
  urls?: string[];
  torrents?: string[];
  savepath?: string;
  category?: string;
  tags?: string[];
  skip_checking?: boolean;
  paused?: boolean;
  root_folder?: boolean;
  rename?: string;
  upLimit?: number;
  dlLimit?: number;
}

export class QBittorrentClient {
  private client: AxiosInstance;
  private baseURL: string;
  private authenticated: boolean = false;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
    });
  }

  async login(username: string = 'admin', password: string = 'adminPassword'): Promise<void> {
    try {
      const response = await this.client.post('/api/v2/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        this.authenticated = true;
      }
    } catch (error) {
      throw new Error(`Failed to authenticate with qBittorrent: ${error}`);
    }
  }

  async getTorrents(filter: string = 'all'): Promise<TorrentInfo[]> {
    if (!this.authenticated) await this.login();

    try {
      const response = await this.client.get<TorrentInfo[]>('/api/v2/torrents/info', {
        params: { filter },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get torrents: ${error}`);
    }
  }

  async getTorrent(hash: string): Promise<TorrentInfo | null> {
    if (!this.authenticated) await this.login();

    try {
      const response = await this.client.get<TorrentInfo[]>('/api/v2/torrents/info', {
        params: { hashes: hash },
      });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      throw new Error(`Failed to get torrent: ${error}`);
    }
  }

  async addTorrent(options: TorrentAddOptions): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      const formData = new FormData();

      if (options.urls) {
        formData.append('urls', options.urls.join('\n'));
      }

      if (options.torrents) {
        options.torrents.forEach((torrent) => {
          formData.append('torrents', torrent);
        });
      }

      if (options.savepath) formData.append('savepath', options.savepath);
      if (options.category) formData.append('category', options.category);
      if (options.tags) formData.append('tags', options.tags.join(','));
      if (options.skip_checking !== undefined) {
        formData.append('skip_checking', options.skip_checking ? 'true' : 'false');
      }
      if (options.paused !== undefined) {
        formData.append('paused', options.paused ? 'true' : 'false');
      }
      if (options.root_folder !== undefined) {
        formData.append('root_folder', options.root_folder ? 'true' : 'false');
      }
      if (options.rename) formData.append('rename', options.rename);
      if (options.upLimit !== undefined) formData.append('upLimit', options.upLimit.toString());
      if (options.dlLimit !== undefined) formData.append('dlLimit', options.dlLimit.toString());

      await this.client.post('/api/v2/torrents/add', formData);
    } catch (error) {
      throw new Error(`Failed to add torrent: ${error}`);
    }
  }

  async removeTorrent(hash: string, deleteFiles: boolean = false): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      await this.client.post('/api/v2/torrents/delete', {
        hashes: hash,
        deleteFiles,
      });
    } catch (error) {
      throw new Error(`Failed to remove torrent: ${error}`);
    }
  }

  async pauseTorrent(hash: string): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      await this.client.post('/api/v2/torrents/pause', {
        hashes: hash,
      });
    } catch (error) {
      throw new Error(`Failed to pause torrent: ${error}`);
    }
  }

  async resumeTorrent(hash: string): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      await this.client.post('/api/v2/torrents/resume', {
        hashes: hash,
      });
    } catch (error) {
      throw new Error(`Failed to resume torrent: ${error}`);
    }
  }

  async getAppState(): Promise<AppState> {
    if (!this.authenticated) await this.login();

    try {
      const response = await this.client.get<AppState>('/api/v2/app/webapiVersion');
      const stateResponse = await this.client.get<AppState>('/api/v2/app/syncMainData');
      return stateResponse.data;
    } catch (error) {
      throw new Error(`Failed to get app state: ${error}`);
    }
  }

  async setCategory(hash: string, category: string): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      await this.client.post('/api/v2/torrents/setCategory', {
        hashes: hash,
        category,
      });
    } catch (error) {
      throw new Error(`Failed to set category: ${error}`);
    }
  }

  async setTags(hash: string, tags: string[]): Promise<void> {
    if (!this.authenticated) await this.login();

    try {
      await this.client.post('/api/v2/torrents/addTags', {
        hashes: hash,
        tags: tags.join(','),
      });
    } catch (error) {
      throw new Error(`Failed to set tags: ${error}`);
    }
  }

  async getCategories(): Promise<Record<string, any>> {
    if (!this.authenticated) await this.login();

    try {
      const response = await this.client.get('/api/v2/torrents/categories');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get categories: ${error}`);
    }
  }

  async getTags(): Promise<string[]> {
    if (!this.authenticated) await this.login();

    try {
      const response = await this.client.get<string[]>('/api/v2/torrents/tags');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get tags: ${error}`);
    }
  }
}
