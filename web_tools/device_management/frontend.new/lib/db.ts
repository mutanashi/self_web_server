import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function openDB() {
  return open({
    filename: './db/data_center.db',
    driver: sqlite3.Database
  })
}

