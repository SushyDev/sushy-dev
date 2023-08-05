import {
  getAccessAndRefreshTokens,
  refreshAccessAndRefreshTokens,
} from '../auth/accessAndRefreshTokens.mjs'

const defaultReturnObject = {
  spotifyClosed: true,
  authenticated: false,
}

export async function currentPlayingInfo() {
  const { accessToken } = await getAccessAndRefreshTokens()
  if (!accessToken) return

  const endpoint = 'https://api.spotify.com/v1/me/player'

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 204)
    return {
      ...defaultReturnObject,
      authenticated: true,
    }

  const data = await response.json()

  if (data.error && data.error.status === 401) {
    await refreshAccessAndRefreshTokens()
    return defaultReturnObject
  }

  return {
    ...defaultReturnObject,
    authenticated: true,
    spotifyClosed: false,
    ...data,
  }
}
