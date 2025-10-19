
// A simple base64 encoder/decoder
const b64_to_utf8 = (str: string) => decodeURIComponent(escape(window.atob(str)));
const utf8_to_b64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));

export class GithubService {
  private token: string;
  private repo: string;
  private owner: string;
  private repoName: string;
  private baseUrl: string = 'https://api.github.com';

  constructor(token: string, repo: string) {
    if (!token || !repo) {
      throw new Error('GitHub token and repository are required.');
    }
    this.token = token;
    this.repo = repo;
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      throw new Error('Invalid repository format. Use "owner/repo-name".');
    }
    this.owner = owner;
    this.repoName = repoName;
  }

  private async request<T,>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 404) {
        return null; // File or resource not found
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${response.status} ${errorData.message || ''}`);
      }
      return response.json() as Promise<T>;
    } catch (error) {
      console.error('GitHub Service Error:', error);
      throw error;
    }
  }

  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    const data = await this.request<{ content: string; sha: string }>(`/repos/${this.owner}/${this.repoName}/contents/${path}`);
    if (data) {
      return {
        content: b64_to_utf8(data.content),
        sha: data.sha,
      };
    }
    return null;
  }

  async createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
    const existingFile = await this.getFile(path);
    const encodedContent = utf8_to_b64(content);

    const body = {
      message,
      content: encodedContent,
      sha: existingFile?.sha,
    };

    await this.request(`/repos/${this.owner}/${this.repoName}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  
  async uploadFile(path: string, base64Content: string, message: string): Promise<void> {
    const existingFile = await this.request<{ sha: string }>(`/repos/${this.owner}/${this.repoName}/contents/${path}`);

    const body = {
      message,
      content: base64Content,
      sha: existingFile?.sha,
    };
    
    await this.request(`/repos/${this.owner}/${this.repoName}/contents/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
  }
}
