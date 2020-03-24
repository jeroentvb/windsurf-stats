import { Sail, Board } from './Gear';

export interface Session {
  hour: number,
  spot: string,
  gear: {
    sail: Sail,
    board: Board
  },
  conditions: Conditions,
  rating: number,
  note: string
}

export interface Conditions {
  windspeed: number,
  windgust: number,
  winddirection: number,
  temperature: number
}
