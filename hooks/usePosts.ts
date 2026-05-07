import { useQuery } from '@tanstack/react-query'

// Define the type for the data you are fetching
export type Post = {
  id: number
  title: string
  body: string
}

const usePosts = (limit: number) => {
  return useQuery({
    queryKey: ['posts', limit],
    queryFn: async (): Promise<Array<Post>> => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts')
      const data = await response.json()
      return data.filter((x: Post) => x.id <= limit)
    },
  })
}

export { usePosts }
