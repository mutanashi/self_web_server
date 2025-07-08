import { appendFile } from "fs/promises"
import path from "path"

export async function logEvent(event: string) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${event}\n`

  const logPath = path.resolve(process.cwd(), "logs", "account.log")

  await appendFile(logPath, logMessage)
}

