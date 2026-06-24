import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeeds } from '../../services/slices/order-slice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { feed, isLoading, error } = useSelector((state) => state.orders);
  const orders = feed?.orders || [];

  useEffect(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return <div>Ошибка загрузки ленты: {error}</div>;
  }

  if (!orders.length) {
    return <div>Нет заказов</div>;
  }

  const handleGetFeeds = () => {
    dispatch(fetchFeeds());
  };

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
