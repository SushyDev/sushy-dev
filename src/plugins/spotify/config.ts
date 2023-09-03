const scopeList = [
  'user-read-currently-playing',
  'user-read-playback-state',
]

export const clientId = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID
export const redirectUri = `${window.location.origin}/spotify`
export const scopes = scopeList.join(' ')
