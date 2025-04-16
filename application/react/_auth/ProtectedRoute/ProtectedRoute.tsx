import { useLayoutEffect, useState } from 'react';
import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../_hooks/useAuth";
import { useRefreshToken } from '../../_hooks/useRefreshToken';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator';
import axios from 'axios';
import { UserAuth } from '../../_context/authProvider';
import { setBearerTokenToAxiosRequestsUsingInterceptors } from '../../axiosHelpers';

type Props = {
  allowedRoles: string[]
}

export const ProtectedRoute = (props: Props) => {
  const { allowedRoles } = props
  const [isLoading, setIsLoading] = useState(true);
  const { auth }: { auth: UserAuth } = useAuth();
  const refreshAccessToken = useRefreshToken();
  const location = useLocation();
  const navigate = useNavigate();

  /* 
    This useEffect checks if the accessToken is null (this usually happens when the page refreshes).
    IFF the accessToken is null, it makes an API call to refresh the accessToken.
  */
  useLayoutEffect(() => {
    let isMounted = true;

    const getNewAccessToken = async () => {
      try {
        await refreshAccessToken(); // throws if the refreshToken is expired or non-existant.
      }
      catch (err) {
        navigate('/react-ui/login', { state: { from: location }, replace: true });
      }
      finally {
        isMounted && setIsLoading(false);
      }
    }

    const doesAccessTokenNeedRefreshed = !auth?.accessToken;

    doesAccessTokenNeedRefreshed ?
      getNewAccessToken()
      : setIsLoading(false);

    return () => {
      isMounted = false;
    }
  }, [])

  /*
    This useEffect handles automatically adding a bearer token to each Axios request's Authorization header.
    [Ex]
      headers: ['Authorization'  => `Bearer ${auth?.accessToken}`]
    
    There's a few edge cases, such as if that accessToken has expired, then this useEffect handles refreshing the accessToken
    via an api call, and then retries the original request.

    Code Credit: https://github.com/gitdagray/react_persist_login/blob/8d489823df307bdecdbdc10dcb79d0c748ca1fca/src/hooks/useAxiosPrivate.js#L10
  */
  useLayoutEffect(() => {
    setBearerTokenToAxiosRequestsUsingInterceptors(axios, auth, refreshAccessToken);
  }, [auth, refreshAccessToken])


  const allowedRolesUppercased = allowedRoles.map(r => r.toUpperCase())

  return (
    <>
      {
        isLoading ? (<LoadingIndicator />) : (
          auth?.authRoles?.find((role) => allowedRolesUppercased?.includes(role.toUpperCase()))
            ? <Outlet />
            : auth?.accessToken
              ? <Navigate to="/react-ui/unauthorized" state={{ from: location }} replace />
              : <Navigate to="/react-ui/login" state={{ from: location }} replace />
        )
      }
    </>
  )
}

export default ProtectedRoute;