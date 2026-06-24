import {
  ingredientReducer,
  initialState,
  addIngredient,
  deleteIngredient,
  moveUpIngredient,
  moveDownIngredient,
  clearConstructorItems,
  fetchIngredients
} from '../ingredient-slice';

describe('ingredientSlice reducer (FULL COVERAGE)', () => {
  it('should return initial state with UNKNOWN action', () => {
    const result = ingredientReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('should handle addIngredient (bun)', () => {
    const bun = {
      _id: '1',
      name: 'bun',
      type: 'bun',
      proteins: 1,
      fat: 1,
      carbohydrates: 1,
      calories: 1,
      price: 1,
      image: '',
      image_large: '',
      image_mobile: ''
    };

    const result = ingredientReducer(initialState, addIngredient(bun));

    expect(result.constructorItems.bun).not.toBeNull();
  });

  it('should handle addIngredient (main ingredient)', () => {
    const main = {
      _id: '2',
      name: 'meat',
      type: 'main',
      proteins: 1,
      fat: 1,
      carbohydrates: 1,
      calories: 1,
      price: 1,
      image: '',
      image_large: '',
      image_mobile: ''
    };

    const result = ingredientReducer(initialState, addIngredient(main));

    expect(result.constructorItems.ingredients.length).toBe(1);
  });

  it('should handle deleteIngredient', () => {
    const state = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          {
            _id: '1',
            id: 'ing-1',
            name: 'test',
            type: 'main',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: '',
            image_large: '',
            image_mobile: ''
          }
        ]
      }
    };

    const result = ingredientReducer(
      state,
      deleteIngredient(state.constructorItems.ingredients[0])
    );

    expect(result.constructorItems.ingredients.length).toBe(0);
  });

  it('should handle moveUpIngredient', () => {
    const state = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          {
            _id: '1',
            id: 'a',
            name: '1',
            type: 'main',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: '',
            image_large: '',
            image_mobile: ''
          },
          {
            _id: '2',
            id: 'b',
            name: '2',
            type: 'main',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: '',
            image_large: '',
            image_mobile: ''
          }
        ]
      }
    };

    const result = ingredientReducer(
      state,
      moveUpIngredient(state.constructorItems.ingredients[1])
    );

    expect(result.constructorItems.ingredients[0].id).toBe('b');
  });

  it('should handle moveDownIngredient', () => {
    const state = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          {
            _id: '1',
            id: 'a',
            name: '1',
            type: 'main',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: '',
            image_large: '',
            image_mobile: ''
          },
          {
            _id: '2',
            id: 'b',
            name: '2',
            type: 'main',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: '',
            image_large: '',
            image_mobile: ''
          }
        ]
      }
    };

    const result = ingredientReducer(
      state,
      moveDownIngredient(state.constructorItems.ingredients[0])
    );

    expect(result.constructorItems.ingredients[1].id).toBe('a');
  });

  it('should handle clearConstructorItems', () => {
    const state = {
      ...initialState,
      constructorItems: {
        bun: {} as any,
        ingredients: [{} as any]
      }
    };

    const result = ingredientReducer(state, clearConstructorItems());

    expect(result.constructorItems.bun).toBeNull();
    expect(result.constructorItems.ingredients.length).toBe(0);
  });

  it('should handle fetchIngredients.pending', () => {
    const result = ingredientReducer(
      initialState,
      fetchIngredients.pending('', undefined)
    );

    expect(result.isLoading).toBe(true);
  });

  it('should handle fetchIngredients.fulfilled', () => {
    const mock = [
      {
        _id: '1',
        name: 'test',
        type: 'main',
        proteins: 1,
        fat: 1,
        carbohydrates: 1,
        calories: 1,
        price: 1,
        image: '',
        image_large: '',
        image_mobile: ''
      }
    ];

    const result = ingredientReducer(
      initialState,
      fetchIngredients.fulfilled(mock as any, '', undefined)
    );

    expect(result.isLoading).toBe(false);
    expect(result.ingredients).toEqual(mock);
    expect(result.isInit).toBe(true);
  });

  it('should handle fetchIngredients.rejected', () => {
    const result = ingredientReducer(
      initialState,
      fetchIngredients.rejected(new Error('error'), '', undefined)
    );

    expect(result.isLoading).toBe(false);
    expect(result.isInit).toBe(true);
  });
});
