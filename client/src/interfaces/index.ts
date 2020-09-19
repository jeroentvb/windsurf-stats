import { Session } from '../../../shared/interfaces/Session';
import { User } from '../../../shared/interfaces/User';

export interface State {
  loggedIn: boolean
  newAccount: boolean
  loading: boolean
  user: User
  snackbar: Snackbar
}

export interface Snackbar {
  text: string
  timeout?: number
  type?: 'succes' | 'info' | 'error'
  show?: boolean
}

export interface ChartData {
  year: number
  amount: number
  labels: string[]
  datasets: {
    data: number[],
    backgroundColor: any[]
    sessions?: Session[]
  }[]
  legend: {
    item: string
    color: string
  }[]
}

export interface DataTableHeader {
  text: string
  value: string
  sortable?: boolean
  align?: string
}
