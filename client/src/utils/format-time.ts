import { formatDistanceToNow } from "date-fns"

export function formatRetryTime(seconds: number): string {
  const retryTime = new Date(Date.now() + seconds * 1000)
  return formatDistanceToNow(retryTime, { addSuffix: true })
}
