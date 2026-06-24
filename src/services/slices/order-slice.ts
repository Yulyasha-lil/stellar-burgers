import {
  getFeedsApi,
  getOrdersApi,
  getOrderByNumberApi,
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

  currentOrder: TOrder | null;

  isLoading: boolean;
  error: string | null;
}

export const initialState: OrderState = {
  orderRequest: false,
  orderModalData: null,

  orders: [],
  feed: null,

  currentOrder: null,

  isLoading: false,
  error: null
};

export const fetchFeeds = createAsyncThunk(
  'orders/fetchFeeds',
  async () => await getFeedsApi()
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => await getOrdersApi()
);

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);

    if (!response.orders.length) {
      throw new Error('Заказ не найден');
    }

    return response.orders[0];
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredients: string[], { dispatch }) => {
    const response = await orderBurgerApi(ingredients);

    dispatch(clearConstructorItems());

    return {
      _id: response.order._id,
      status: response.order.status,
      name: response.order.name,
      createdAt: response.order.createdAt,
      updatedAt: response.order.updatedAt,
      number: response.order.number,
      ingredients
    } as TOrder;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    closeOrder(state) {
      state.orderModalData = null;
      state.currentOrder = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
      })

      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
      })

      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
      })

      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message ?? null;
      });
  }
});

export const { closeOrder } = orderSlice.actions;

export const orderReducer = orderSlice.reducer;
