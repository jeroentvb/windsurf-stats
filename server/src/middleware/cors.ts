import cors from 'cors'

export function corsHandler () {
  return cors({
    origin: 'http://localhost:8080',
    credentials: true
  })
}