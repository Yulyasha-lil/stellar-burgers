import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { checkUser } from '../../services/slices/user-slice';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children
}: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Проверяем пользователя только если еще не проверяли
    if (!isAuthChecked) {
      dispatch(checkUser());
    }
  }, [dispatch, isAuthChecked]);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Если пользователь не авторизован и страница требует авторизации
  if (!onlyUnAuth && !user) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  // Если пользователь авторизован и пытается попасть на страницы для неавторизованных
  if (onlyUnAuth && user) {
    const from = location.state?.from || '/';
    return <Navigate replace to={from} />;
  }

  return children;
};
