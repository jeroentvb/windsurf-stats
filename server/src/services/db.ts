import MongoClient, { InsertOneWriteOpResult, UpdateWriteOpResult } from 'mongodb'
import chalk from 'chalk'

import { User } from '../../../shared/interfaces/User'
import { DB_COLLECTION_NAME, MONGO_CONFIG, MONGO_URL } from '../constants/db'

require('dotenv').config()

let db: MongoClient.Db

function parseId (id?: string): MongoClient.ObjectId {
  return new MongoClient.ObjectId(id)
}

function init (database: string): Promise<any> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(`${MONGO_URL}${database}`, MONGO_CONFIG, (err, mongoClient) => {
      if (err) reject(err)

      console.log(chalk.green('[MongoDB] connection created'))

      db = mongoClient.db(database)

      resolve(mongoClient)
    })
  })
}

function get (query: object): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.collection(DB_COLLECTION_NAME).find(query).toArray((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function insert (data: any): Promise<InsertOneWriteOpResult<any>> {
  return db.collection(DB_COLLECTION_NAME).insertOne(data)
}

function update (query: object, data: any): Promise<UpdateWriteOpResult> {
  return db.collection(DB_COLLECTION_NAME).updateOne(query, data)
}

export default {
  parseId,
  init,
  get,
  insert,
  update
}
