import { API_CONFIG } from '../config/api';
import { StorageService } from './StorageService';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Attempt to refresh the access token. Deduplicates concurrent refresh calls.
   * Returns true if refresh succeeded.
   */
  private static refreshHandler: (() => Promise<void>) | null = null;

  /**
   * Register a token refresh handler (called by AuthService on init to avoid circular deps)
   */
  public static setRefreshHandler(handler: () => Promise<void>): void {
    this.refreshHandler = handler;
  }

  private static async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshHandler) return false;

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        await this.refreshHandler!();
        return true;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Build full URL from endpoint
   */
  private static buildUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  /**
   * Get authorization headers
   */
  private static async getAuthHeaders(token?: string): Promise<Record<string, string>> {
    const authToken = token || await StorageService.getAccessToken();

    if (!authToken) {
      throw new Error('No access token available for API call');
    }

    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create headers without authentication
   */
  private static getPublicHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  /**
   * Handle API response
   */
  private static async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.text();
      
      if (__DEV__) {
        console.error('[API Error]', response.status, errorBody);
      }

      // Parse error message from response body if available
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorJson.detail || errorMessage;
      } catch {
        // Use default message if parsing fails
      }

      throw new ApiError(response.status, errorMessage, errorBody);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    if (
      response.status === 204 ||
      contentLength === '0' ||
      !contentType ||
      !contentType.includes('application/json')
    ) {
      if (__DEV__) {
        console.log('[API Success - No Content]', endpoint);
      }
      return null as unknown as T;
    }

    const data: T = await response.json();
    
    if (__DEV__) {
      console.log('[API Success]', endpoint);
    }

    return data;
  }

  /**
   * Generic request handler with automatic 401 retry via token refresh
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit,
    logPrefix: string,
    isRetry = false
  ): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);

      if (__DEV__) {
        console.log(`[${logPrefix}]`, url);
      }

      const response = await fetch(url, options);

      if (response.status === 401 && !isRetry) {
        if (__DEV__) {
          console.log('[API] 401 received, attempting token refresh...');
        }

        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Rebuild auth headers with new token and retry
          const newToken = await StorageService.getAccessToken();
          if (newToken && options.headers) {
            const headers = { ...(options.headers as Record<string, string>) };
            headers['Authorization'] = `Bearer ${newToken}`;
            options.headers = headers;
          }
          return this.request<T>(endpoint, options, logPrefix, true);
        }
      }

      return await this.handleResponse<T>(response, endpoint);

    } catch (error) {
      if (__DEV__) {
        console.error('[API Request Failed]', endpoint, error);
      }
      throw error;
    }
  }

  /**
   * GET request with authentication
   */
  public static async get<T>(
    endpoint: string,
    token?: string,
    queryParams?: Record<string, string>
  ): Promise<T> {
    const headers = await this.getAuthHeaders(token);
    let url = endpoint;

    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url = `${url}?${params}`;
    }

    return this.request<T>(url, {
      method: 'GET',
      headers,
    }, 'API GET');
  }

  /**
   * POST request with authentication
   */
  public static async post<T, B = any>(
    endpoint: string,
    body: B,
    token?: string
  ): Promise<T> {
    const headers = await this.getAuthHeaders(token);
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }, 'API POST');
  }

  /**
   * PUT request with authentication
   */
  public static async put<T, B = any>(
    endpoint: string,
    body: B,
    token?: string
  ): Promise<T> {
    const headers = await this.getAuthHeaders(token);

    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }, 'API PUT');
  }

  /**
   * PATCH request with authentication
   */
  public static async patch<T, B = any>(
    endpoint: string,
    body: B,
    token?: string
  ): Promise<T> {
    const headers = await this.getAuthHeaders(token);

    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }, 'API PATCH');
  }

  /**
   * DELETE request with authentication
   */
  public static async delete<T>(
    endpoint: string,
    token?: string
  ): Promise<T> {
    const headers = await this.getAuthHeaders(token);

    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    }, 'API DELETE');
  }

  /**
   * POST request with form data (for login, file uploads, etc.)
   */
  public static async postForm<T>(
    endpoint: string,
    formData: URLSearchParams | FormData,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers = formData instanceof FormData 
      ? customHeaders 
      : { 'Content-Type': 'application/x-www-form-urlencoded', ...customHeaders };

    // isRetry=true: form endpoints (login, etc.) never trigger the refresh loop
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData instanceof FormData ? formData : formData.toString(),
    }, 'API POST FORM', true);
  }

  /**
   * POST multipart/form-data with authentication (for file uploads)
   */
  public static async postFormAuth<T>(
    endpoint: string,
    formData: FormData,
    token?: string
  ): Promise<T> {
    const authToken = token || await StorageService.getAccessToken();
    if (!authToken) {
      throw new Error('No access token available for API call');
    }
    // Do NOT set Content-Type — fetch will set it with the multipart boundary
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData,
    }, 'API POST FORM AUTH');
  }

  /**
   * GET request without authentication (for public endpoints)
   */
  public static async getPublic<T>(
    endpoint: string,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const headers = this.getPublicHeaders(customHeaders);

    // isRetry=true: public endpoints never trigger the refresh loop
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    }, 'API GET PUBLIC', true);
  }

  /**
   * POST request without authentication (for registration, etc.)
   */
  public static async postPublic<T, B = any>(
    endpoint: string,
    body: B,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const headers = this.getPublicHeaders(customHeaders);

    // isRetry=true: public endpoints never trigger the refresh loop
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }, 'API POST PUBLIC', true);
  }
}