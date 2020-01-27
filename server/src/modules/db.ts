import MongoClient, { Db, InsertOneWriteOpResult } from 'mongodb'
import chalk from 'chalk'

export let db: Db
export let client: MongoClient.MongoClient

export function init (database: string) {
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

export function get (query?: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.collection('users').find(query).toArray((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

export function insert (data: any) {
  return db.collection('users').insertOne(data)
}
