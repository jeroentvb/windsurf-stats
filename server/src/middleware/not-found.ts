import { Request, Response } from 'express'

export function notFound (_req: Request, res: Response): void {
  res.status(404).send('Not found')
}
