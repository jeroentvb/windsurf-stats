import { Session } from '../../../shared/interfaces/Session';

export interface Snackbar {
  text: string
  timeout?: number
  type?: 'succes' | 'info' | 'error'
}

export interface ChartData {
  year: number
  labels: string[]
  datasets: {
    data: number[],
    backgroundColor: any[]
    sessions: Session[]
  }[]
}
