import { Gear } from './Gear';
import { Session } from './Session';
import { Spot } from './Spot'

export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  gear?: Gear
  spots?: Spot[]
  sessions?: Session[]
}
