import MongoClient, { Db, ObjectId } from 'mongodb'
import chalk from 'chalk'
import { User } from '../../../shared/interfaces/User'

export let db: Db
export let client: MongoClient.MongoClient

export function parseId (id?: string): ObjectId {
  return new ObjectId(id)
}

export function init (database: string): Promise<void> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(`mongodb://localhost:27017/${database}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, (err, mongoClient) => {
      if (err) reject(err)

      console.log(chalk.green('[MongoDB] connection created'))

      client = mongoClient
      db = mongoClient.db(database)

      resolve()
    })
  })
}

export function get (query: object): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.collection('users').find(query).toArray((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

export function insert (data: any): Promise<any> {
  return db.collection('users').insertOne(data)
}

export function update (query: object, data: any): Promise<any> {
  return db.collection('users').updateOne(query, data)
}
