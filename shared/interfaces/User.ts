import { Gear } from "./Gear";

export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  gear?: Gear
  spots?: Spot[]
  sessions?: any
}

export interface Spot {
  id: string
  name?: string
}
