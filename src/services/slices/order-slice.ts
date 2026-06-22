import {
  getFeedsApi,
  getOrdersApi,
  orderBurgerApi,
  TFeedsResponse
} from '../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '../../utils/types';
import { clearConstructorItems } from './ingredient-slice';

interface OrderState {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orders: TOrder[];
  feed: TFeedsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const fetchFeeds = createAsyncThunk(
  'feed/fetchFeeds',
  async () => await getFeedsApi()
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => await getOrdersApi()
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (data: string[], { dispatch }) => {
    const response = await orderBurgerApi(data);

    const order: TOrder = {
      _id: response.order._id,
      status: response.order.status,
      name: response.order.name,
      createdAt: response.order.createdAt,
      updatedAt: response.order.updatedAt,
      number: response.order.number,
      ingredients: data
    };

    // Конструктор очищается сразу после успешного создания заказа
    dispatch(clearConstructorItems());

    return order;
  }
);

export const initialState: OrderState = {
  orderRequest: false,
  orderModalData: null,
  orders: [],
  feed: null,
  isLoading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    closeOrder: (state) => {
      state.orderRequest = false;
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Общая лента заказов
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
        state.error = null;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
      })

      // История заказов пользователя
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false; // исправление ревьюера
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
      })

      // Создание заказа
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderRequest = false;
        state.error = null;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.orderRequest = false;
        state.error = action.error.message ?? null;
      });
  }
});

export const { closeOrder } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
