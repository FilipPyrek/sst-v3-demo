import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { Resource } from 'sst';
import postgres from 'postgres';

const sql = postgres({
  username: Resource.MyDatabase.username,
  password: Resource.MyDatabase.password,
  database: Resource.MyDatabase.database,
  host: Resource.MyDatabase.host,
  port: Resource.MyDatabase.port
});

const app = new Hono()

app.get('/', async (c) => {
  console.log('querying DB')
  const dbresult = await sql`select 1`
  console.log('DB result', dbresult)
  
  return c.json({ dbresult })
})

export const handler = handle(app)
