import {
  orderReducer,
  initialState,
  closeOrder,
  fetchFeeds,
  fetchOrders,
  fetchOrderByNumber,
  createOrder
} from '../order-slice';

describe('orderSlice reducer (FULL COVERAGE)', () => {
  it('should return initial state with UNKNOWN action', () => {
    const result = orderReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('should handle closeOrder', () => {
    const state = {
      ...initialState,
      orderModalData: {} as any,
      currentOrder: {} as any,
      orderRequest: true
    };

    const result = orderReducer(state, closeOrder());

    expect(result.orderModalData).toBeNull();
    expect(result.currentOrder).toBeNull();
    expect(result.orderRequest).toBe(false);
  });

  it('should handle fetchFeeds.pending', () => {
    const result = orderReducer(
      initialState,
      fetchFeeds.pending('', undefined)
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle fetchFeeds.fulfilled', () => {
    const mock = {
      success: true,
      orders: [],
      total: 0,
      totalToday: 0
    };

    const result = orderReducer(
      initialState,
      fetchFeeds.fulfilled(mock, '', undefined)
    );

    expect(result.feed).toEqual(mock);
    expect(result.isLoading).toBe(false);
  });

  it('should handle fetchFeeds.rejected', () => {
    const result = orderReducer(
      initialState,
      fetchFeeds.rejected(new Error('err'), '', undefined)
    );

    expect(result.error).toBe('err');
    expect(result.isLoading).toBe(false);
  });

  it('should handle fetchOrders.fulfilled', () => {
    const mock = [
      {
        _id: '1',
        name: 'order',
        status: 'done',
        createdAt: '',
        updatedAt: '',
        number: 1,
        ingredients: []
      }
    ];

    const result = orderReducer(
      initialState,
      fetchOrders.fulfilled(mock as any, '', undefined)
    );

    expect(result.orders).toEqual(mock);
  });

  it('should handle fetchOrderByNumber.fulfilled', () => {
    const mock = {
      _id: '1',
      name: 'order',
      status: 'done',
      createdAt: '',
      updatedAt: '',
      number: 1,
      ingredients: []
    };

    const result = orderReducer(
      initialState,
      fetchOrderByNumber.fulfilled(mock, '', 1)
    );

    expect(result.currentOrder).toEqual(mock);
  });

  it('should handle createOrder.fulfilled', () => {
    const mock = {
      _id: '1',
      name: 'order',
      status: 'done',
      createdAt: '',
      updatedAt: '',
      number: 1,
      ingredients: ['1']
    };

    const result = orderReducer(
      initialState,
      createOrder.fulfilled(mock as any, '', ['1'])
    );

    expect(result.orderModalData).toEqual(mock);
    expect(result.orderRequest).toBe(false);
  });

  it('should handle createOrder.pending', () => {
    const result = orderReducer(initialState, createOrder.pending('', ['1']));

    expect(result.orderRequest).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle createOrder.rejected', () => {
    const result = orderReducer(
      initialState,
      createOrder.rejected(new Error('fail'), '', ['1'])
    );

    expect(result.orderRequest).toBe(false);
    expect(result.error).toBe('fail');
  });
});
