import { clientId, redirectUri } from '../config.js'
import { getAuthToken } from './authToken.mjs'
import { getCodeVerifier } from './codeVerifier.mjs'

function handleReturnedAccessAndRefreshTokens({
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

async function fetchAccesAndRefreshTokens() {
  const codeVerifier = getCodeVerifier()
  const authToken = getAuthToken()

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

  return handleReturnedAccessAndRefreshTokens(data)
}

export async function getAccessAndRefreshTokens() {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (accessToken && refreshToken) return { accessToken, refreshToken }

  const tokens = await fetchAccesAndRefreshTokens()
  const empty = { accessToken: null, refreshToken: null }

  return tokens ?? empty
}

export async function refreshAccessAndRefreshTokens() {
  const { refreshToken } = await getAccessAndRefreshTokens()
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

  return handleReturnedAccessAndRefreshTokens(data)
}

// Refresh access token every 50 minutes
setInterval(async () => {
  try {
    await refreshAccessAndRefreshTokens()
  } catch (error) {
    console.error(error)
  }
}, 50 * 60 * 1000)
