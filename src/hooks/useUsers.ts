import useSWR from 'swr'
import { User } from '@prisma/client'

export const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useUsers() {
  const { data, error, mutate } = useSWR<User[]>('/api/users', fetcher)

  return {
    users: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}