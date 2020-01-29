export interface Sail {
  id?: string
  brand: string
  model: string
  size: string
}

export interface Board {
  id?: string
  brand: string
  model: string
  volume: string
}

export interface Gear {
  sails: Sail[]
  boards: Board[]
}