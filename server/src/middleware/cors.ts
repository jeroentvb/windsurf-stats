import cors from 'cors'

export default function corsHandler () {
  return cors({
    origin: 'http://localhost:8080',
    credentials: true
  })
}