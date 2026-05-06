import { useQuery } from '@tanstack/react-query'

// Define the type for the data you are fetching
export type Post = {
  id: number
  title: string
  body: string
}

// Extract the fetch function so it can be used standalone or in the queryFn
const fetchPosts = async (limit = 10): Promise<Array<Post>> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  const data = await response.json()
  return data.filter((x: Post) => x.id <= limit)
}

// Create the custom hook that wraps useQuery
const usePosts = (limit: number) => {
  return useQuery({
    queryKey: ['posts', limit],
    queryFn: () => fetchPosts(limit),
  })
}

export { usePosts, fetchPosts }
