import MongoClient, { InsertOneWriteOpResult, UpdateWriteOpResult } from 'mongodb'
import chalk from 'chalk'

import { User } from '../../../shared/interfaces/User'

require('dotenv').config()

let db: MongoClient.Db
let client: MongoClient.MongoClient

function parseId (id?: string): MongoClient.ObjectId {
  return new MongoClient.ObjectId(id)
}

function init (database: string): Promise<any> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(`mongodb://localhost:27017/${database}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, (err, mongoClient) => {
      if (err) reject(err)

      console.log(chalk.green('[MongoDB] connection created'))

      client = mongoClient
      db = mongoClient.db(database)

      resolve(mongoClient)
    })
  })
}

function get (query: object): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.collection('users').find(query).toArray((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function insert (data: any): Promise<InsertOneWriteOpResult<any>> {
  return db.collection('users').insertOne(data)
}

function update (query: object, data: any): Promise<UpdateWriteOpResult> {
  return db.collection('users').updateOne(query, data)
}

export default {
  parseId,
  init,
  get,
  insert,
  update
}
