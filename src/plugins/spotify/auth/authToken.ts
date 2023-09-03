import { clientId, redirectUri, scopes } from '@spotify/config.js'
import CodeVerifier from '@spotify/auth/codeVerifier.js'

export default class AuthToken {
  static async fetch(): Promise<void> {
    const codeChallenge = await CodeVerifier.generateCodeChallenge();

    const queryParams = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: scopes,
    })

    const authUrl = `https://accounts.spotify.com/authorize?${queryParams}`

    window.location.href = authUrl
  }

  static get(): string|void {
    // Check for localstorage
    const authToken = localStorage.getItem('authToken')
    if (authToken) return authToken

    // Check for url params
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) return code

    AuthToken.fetch()
  }
}
