import { Gear } from "./Gear";

export interface User {
  name: string
  email: string
  gear?: Gear
  spots?: any
  sessions?: any
}
