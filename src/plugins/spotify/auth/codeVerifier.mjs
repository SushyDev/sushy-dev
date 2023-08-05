import { Buffer } from 'buffer'

function generateRandomString(length) {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'

  const possibleCharacters = `${uppercaseLetters}${lowercaseLetters}${numbers}`

  const randomString = Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * possibleCharacters.length)
    return possibleCharacters.charAt(randomIndex)
  }).join('')

  return randomString
}

function base64encode(string) {
  const buffer = Buffer.from(string, 'utf-8')
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)

  return base64encode(digest)
}

export function getCodeVerifier() {
  const codeVerifier = localStorage.getItem('codeVerifier')
  if (codeVerifier) return codeVerifier

  console.info('Generating new code verifier')

  const newCodeVerifier = generateRandomString(128)
  localStorage.setItem('codeVerifier', newCodeVerifier)
  return newCodeVerifier
}
