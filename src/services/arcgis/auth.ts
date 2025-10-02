/**
 * ArcGIS OAuth Authentication Service
 *
 * Implements OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure
 * authentication to private ArcGIS Online feature services.
 */

import { arcgisConfig } from "../../config/arcgis.config";

class ArcGISAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private codeVerifier: string | null = null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    return null;
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const verifier = this.generateRandomString(128);
    const challenge = await this.generateCodeChallenge(verifier);
    return { verifier, challenge };
  }

  private generateRandomString(length: number): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values)
      .map((v) => charset[v % charset.length])
      .join("");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return this.base64UrlEncode(hash);
  }

  private base64UrlEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Initiate OAuth login flow
   */
  async login(): Promise<void> {
    if (!arcgisConfig.oauth.clientId) {
      throw new Error("OAuth client ID not configured");
    }

    const { verifier, challenge } = await this.generatePKCE();
    this.codeVerifier = verifier;

    // Store verifier in sessionStorage for callback
    sessionStorage.setItem("pkce_verifier", verifier);

    const params = new URLSearchParams({
      client_id: arcgisConfig.oauth.clientId,
      response_type: "code",
      redirect_uri: arcgisConfig.oauth.redirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: this.generateRandomString(32),
    });

    const authUrl = `${arcgisConfig.oauth.portalUrl}/sharing/rest/oauth2/authorize?${params}`;

    // Store current location to redirect back after auth
    sessionStorage.setItem("auth_redirect", window.location.pathname);

    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem("pkce_verifier");
    if (!verifier) {
      throw new Error("PKCE verifier not found");
    }

    const params = new URLSearchParams({
      client_id: arcgisConfig.oauth.clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: arcgisConfig.oauth.redirectUri,
      code_verifier: verifier,
    });

    const tokenUrl = `${arcgisConfig.oauth.portalUrl}/sharing/rest/oauth2/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange authorization code for token");
    }

    const data = await response.json();

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    // Clean up session storage
    sessionStorage.removeItem("pkce_verifier");
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const params = new URLSearchParams({
      client_id: arcgisConfig.oauth.clientId,
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
    });

    const tokenUrl = `${arcgisConfig.oauth.portalUrl}/sharing/rest/oauth2/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      // Refresh token expired, need to re-authenticate
      this.logout();
      throw new Error("Refresh token expired, please log in again");
    }

    const data = await response.json();

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
  }

  /**
   * Log out and clear tokens
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.codeVerifier = null;
    sessionStorage.removeItem("pkce_verifier");
    sessionStorage.removeItem("auth_redirect");
  }

  /**
   * Check if OAuth callback is in URL and handle it
   */
  async checkForCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      await this.handleCallback(code);

      // Redirect back to original location
      const redirectPath = sessionStorage.getItem("auth_redirect") || "/";
      sessionStorage.removeItem("auth_redirect");

      // Clean URL
      window.history.replaceState({}, document.title, redirectPath);

      return true;
    }

    return false;
  }
}

// Export singleton instance
export const authService = new ArcGISAuthService();
