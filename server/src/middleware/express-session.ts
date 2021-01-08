import session, { SessionOptions } from 'express-session'
import mongo from 'connect-mongo'

import { MongoClient } from 'mongodb'

const MongoStore = mongo(session)

require('dotenv').config()

export function sessionStore (client: Promise<MongoClient>) {
  return session({
    store: new MongoStore({
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
