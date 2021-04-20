import { Request, Response, NextFunction } from 'express'
import { UNPROTECTED_ROUTES } from '../constants/unprotected-routes'

export function checkLogin (req: Request, res: Response, next: NextFunction) {
  const protectedRoute = UNPROTECTED_ROUTES.findIndex((route) => route === req.path) === -1

  if (!req.session!.user && protectedRoute) {
    res.status(401).send()
  } else {
    next()
  }
}
