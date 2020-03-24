export interface Snackbar {
  text: string
  timeout?: number
  type?: 'succes' | 'info' | 'error'
}