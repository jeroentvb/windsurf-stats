import session, { SessionOptions } from 'express-session'
import MongoStore from 'connect-mongo'

import { MongoClient } from 'mongodb'
import { User } from '../../../shared/interfaces/User'

/**
 * Define custom session properties
 */
declare module 'express-session' {
  interface Session {
    user: User;
  }
}

require('dotenv').config()

export function sessionStore (client: Promise<MongoClient>) {
  return session({
    store: MongoStore.create({
      clientPromise: client
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: parseInt(<string>process.env.COOKIE_MAX_AGE)
    }
  } as SessionOptions)
}
