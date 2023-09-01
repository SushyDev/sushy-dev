import { clientId, redirectUri } from '../config.js'
import CodeVerifier from './codeVerifier.js'
import AuthToken from './authToken.js'

export default class AccessAndRefreshTokens {
  static handleResponse({
    access_token: accessToken,
    refresh_token: refreshToken,
    error,
  }) {
    setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      window.history.replaceState({}, document.title, url)
    }, 1)

    if (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      throw new Error(error)
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }

  async handle({ access_token: accessToken, refresh_token: refreshToken, error }) {
    setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      window.history.replaceState({}, document.title, url)
    }, 1)

    if (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      throw new Error(error)
    }

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new Error('Access and refresh tokens must be strings')
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    return { accessToken, refreshToken }
  }

  static async fetch() {
    const codeVerifier = CodeVerifier.get()
    const authToken = AuthToken.get()

    if (!authToken) return

    const tokenEndpoint = 'https://accounts.spotify.com/api/token'

    const formData = new URLSearchParams()
    formData.append('grant_type', 'authorization_code')
    formData.append('code', authToken)
    formData.append('redirect_uri', redirectUri)
    formData.append('client_id', clientId)
    formData.append('code_verifier', codeVerifier)

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await response.json()

    return AccessAndRefreshTokens.handleResponse(data)
  }

  static async get() {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (accessToken && refreshToken) return { accessToken, refreshToken }

    const tokens = await this.fetch()
    const empty = { accessToken: null, refreshToken: null }

    return tokens ?? empty
  }

  static async refresh() {
    const { refreshToken } = await this.get()
    if (!refreshToken) throw new Error('No refresh token found')

    console.info('Refreshing access token')

    const tokenEndpoint = 'https://accounts.spotify.com/api/token'

    const formData = new URLSearchParams()
    formData.append('grant_type', 'refresh_token')
    formData.append('refresh_token', refreshToken)
    formData.append('client_id', clientId)

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await response.json()

    return AccessAndRefreshTokens.handleResponse(data)
  }
}

// Refresh access token every 50 minutes
setInterval(async () => {
  try {
    await AccessAndRefreshTokens.refresh()
  } catch (error) {
    console.error(error)
  }
}, 50 * 60 * 1000)
