import bcrypt from 'bcrypt'
import { Session } from '../../../shared/interfaces/Session'
require('dotenv').config()

export function hashPassword (password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, parseInt(<string>process.env.SALT_ROUNDS), (err, hash) => {
      if (err) reject(err)
      resolve(hash)
    })
  })
}

export function getToday (): string {
  const today = new Date()
  let dd: any = today.getDate()
  let mm: any = today.getMonth() + 1
  let yyyy = today.getFullYear()

  if (dd < 10) dd = `0${dd}`
  if (mm < 10) mm = `0${mm}`

  return `${dd}-${mm}-${yyyy}`
}

export function getYesterday (): string {
  const today = new Date()
  let dd: any = today.getDate()
  let mm: any = today.getMonth() + 1
  let yyyy = today.getFullYear()

  if (dd < 10) dd = `0${dd}`
  if (mm < 10) mm = `0${mm}`

  if (dd - 1 === 0) {
    return `${30}-${mm - 1}-${yyyy}`
  } else {
    return `${dd - 1}-${mm}-${yyyy}`
  }
}

export function getWindDirection (deg: number): string {
  const windDirections = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW'
  ]

  const val = Math.floor((deg / 22.5) + 0.5)
  return windDirections[(val % 16)]
}

export function validateSessionData (session: Session): boolean {
  let valid: boolean = true

  for (const [key, value] of Object.entries(session)) {
    if (!value) valid = false
  }
  for (const [key, value] of Object.entries(session.time)) {
    if (!value) valid = false
  }
  for (const [key, value] of Object.entries(session.gear)) {
    if (!value) valid = false
  }
  for (const [key, value] of Object.entries(session.conditions)) {
    if (!value && value !== 0) valid = false
  }
  
  return valid
}
