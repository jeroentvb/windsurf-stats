export interface Session {
  date: Date | string
  time: {
    start: number
    end: number
  }
  spot: string
  gear: {
    sail: string
    board: string
  }
  conditions: Conditions
  rating: number
  note: string
}

export interface Conditions {
  // Hour is only included because wind-scrape provides it. It's not sent to the server & stored in the db
  hour?: number
  windspeed: number
  windgust: number
  winddirection: number
  temperature: number
}
