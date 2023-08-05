const scopeList = [
  'user-read-currently-playing',
  'user-read-playback-state',
]

export const clientId = '23c464ff1215423ba8171e50f2f09b2c'
export const redirectUri = `${window.location.origin}/spotify`
export const scopes = scopeList.join(' ')
