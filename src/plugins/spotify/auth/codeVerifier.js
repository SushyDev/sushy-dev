import { Buffer } from 'buffer'

export default class CodeVerifier {
  static #base64encode(string) {
    return Buffer.from(string, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  static #generateRandomString(length) {
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

  static get() {
    const codeVerifier = localStorage.getItem('codeVerifier')
    if (codeVerifier) return codeVerifier

    console.info('Generating new code verifier string')

    const newCodeVerifier = CodeVerifier.#generateRandomString(128)
    localStorage.setItem('codeVerifier', newCodeVerifier)

    return newCodeVerifier
  }

  static async generateCodeChallenge() {
    const string = CodeVerifier.get()

    const encoder = new TextEncoder()
    const data = encoder.encode(string)
    const digest = await window.crypto.subtle.digest('SHA-256', data)

    return CodeVerifier.#base64encode(digest)
  }
}
