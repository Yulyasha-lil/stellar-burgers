import {
  getFeedsApi,
  getOrderByNumberApi,
  getOrdersApi,
  orderBurgerApi,
  TFeedsResponse
} from '../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '../../utils/types';

interface Order {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  feed: TFeedsResponse | null;
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
  async (data: string[]) => {
    const response = await orderBurgerApi(data);
    // Преобразуем TNewOrder в TOrder
    const order: TOrder = {
      _id: response.order._id,
      status: response.order.status,
      name: response.order.name,
      createdAt: response.order.createdAt,
      updatedAt: response.order.updatedAt,
      number: response.order.number,
      ingredients: data // используем переданные ингредиенты
    };
    return { order };
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  'order/fetchOrderByNumber',
  async (number: number) => await getOrderByNumberApi(number)
);

export const initialState: Order = {
  orderRequest: false,
  orderModalData: null,
  orders: [],
  isLoading: false,
  error: null,
  feed: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    closeOrder: (state) => {
      state.orderRequest = false;
      state.orderModalData = null;
    },
    clearOrderModalData: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFeeds.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeeds.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.error.message as string) ?? null;
    });
    builder.addCase(fetchFeeds.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orderRequest = false;
      state.feed = action.payload;
    });
    builder.addCase(fetchOrders.pending, (state) => {
      state.isLoading = true;
      state.orderRequest = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.error.message as string) ?? null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.orderRequest = false;
      state.orders = action.payload;
      state.error = null;
    });
    builder.addCase(createOrder.pending, (state) => {
      state.isLoading = true;
      state.orderRequest = true;
      state.error = null;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.isLoading = false;
      state.orderRequest = false;
      state.error = (action.error.message as string) ?? null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orderRequest = false;
      state.error = null;
      state.orderModalData = action.payload.order;
    });
    builder.addCase(fetchOrderByNumber.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderByNumber.rejected, (state, action) => {
      state.error = (action.error.message as string) ?? null;
      state.isLoading = false;
    });
    builder.addCase(fetchOrderByNumber.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.orderModalData = action.payload.orders[0];
    });
  }
});

export const { closeOrder, clearOrderModalData } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
