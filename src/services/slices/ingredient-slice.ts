import { getIngredientsApi } from '../../utils/burger-api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient } from '../../utils/types';

type TConstructorItems = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TBurgerIngredients = {
  ingredients: Array<TIngredient>;
  constructorItems: TConstructorItems;
  isLoading: boolean;
  isInit: boolean;
};

export const initialState: TBurgerIngredients = {
  ingredients: [],
  isLoading: false,
  isInit: false,
  constructorItems: {
    bun: null,
    ingredients: []
  }
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => await getIngredientsApi()
);

const ingredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.constructorItems = {
            ...state.constructorItems,
            bun: { ...action.payload }
          };
        } else {
          state.constructorItems = {
            ...state.constructorItems,
            ingredients: [...state.constructorItems.ingredients, action.payload]
          };
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: Date.now().toString() }
      })
    },
    deleteIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ingredient: TConstructorIngredient) =>
            ingredient.id !== action.payload.id
        );
    },
    moveUpIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      const index = state.constructorItems.ingredients.findIndex(
        (item: TConstructorIngredient) => item.id === action.payload.id
      );
      if (index > 0) {
        const ingredientToMove = state.constructorItems.ingredients[index];
        state.constructorItems.ingredients.splice(index, 1);
        state.constructorItems.ingredients.splice(
          index - 1,
          0,
          ingredientToMove
        );
      }
    },
    moveDownIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      const index = state.constructorItems.ingredients.findIndex(
        (item: TConstructorIngredient) => item.id === action.payload.id
      );
      if (
        index !== -1 &&
        index < state.constructorItems.ingredients.length - 1
      ) {
        const ingredientToMove = state.constructorItems.ingredients[index];
        state.constructorItems.ingredients.splice(index, 1);
        state.constructorItems.ingredients.splice(
          index + 1,
          0,
          ingredientToMove
        );
      }
    },
    clearConstructorItems: (state) => {
      state.constructorItems.bun = null;
      state.constructorItems.ingredients = [];
    }
  },
  selectors: {
    getBuns: (state: TBurgerIngredients) =>
      state.ingredients.filter(
        (ingredient: TIngredient) => ingredient.type === 'bun'
      ),
    getMains: (state: TBurgerIngredients) =>
      state.ingredients.filter(
        (ingredient: TIngredient) => ingredient.type === 'main'
      ),
    getSauces: (state: TBurgerIngredients) =>
      state.ingredients.filter(
        (ingredient: TIngredient) => ingredient.type === 'sauce'
      )
  },
  extraReducers: (builder) => {
    builder.addCase(fetchIngredients.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchIngredients.rejected, (state) => {
      state.isInit = true;
      state.isLoading = false;
    });
    builder.addCase(fetchIngredients.fulfilled, (state, { payload }) => {
      state.isInit = true;
      state.isLoading = false;
      state.ingredients = payload;
    });
  }
});

export const { getBuns, getMains, getSauces } = ingredientSlice.selectors;

export const {
  addIngredient,
  deleteIngredient,
  moveUpIngredient,
  moveDownIngredient,
  clearConstructorItems
} = ingredientSlice.actions;

export const ingredientReducer = ingredientSlice.reducer;
