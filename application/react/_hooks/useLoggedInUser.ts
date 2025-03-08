import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLoggedInUser } from "../_queries/auth"
import { IUser } from "@shared/types/models"

const LOGGED_IN_USER_QUERY_KEY = 'get-me'
export const useLoggedInUser = () => {
  const { data: user, error, isFetching, isLoading, isError } = useQuery<IUser>({
    queryKey: [LOGGED_IN_USER_QUERY_KEY],
    queryFn: getLoggedInUser,
  })

  return {
    user,
    isLoading,
    isFetching,
    error,
    isError
  }
}

export const refreshLoggedInUser = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: [LOGGED_IN_USER_QUERY_KEY]})
}