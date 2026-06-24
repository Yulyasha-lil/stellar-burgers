import { getIngredientsApi } from '../../utils/burger-api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { TConstructorIngredient, TIngredient } from '../../utils/types';

type TConstructorItems = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TBurgerIngredients = {
  ingredients: TIngredient[];
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
          state.constructorItems.bun = action.payload;
        } else {
          state.constructorItems.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          id: uuid()
        }
      })
    },

    deleteIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ingredient) => ingredient.id !== action.payload.id
        );
    },

    moveUpIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      const index = state.constructorItems.ingredients.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index > 0) {
        const ingredient = state.constructorItems.ingredients[index];
        state.constructorItems.ingredients.splice(index, 1);
        state.constructorItems.ingredients.splice(index - 1, 0, ingredient);
      }
    },

    moveDownIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      const index = state.constructorItems.ingredients.findIndex(
        (item) => item.id === action.payload.id
      );

      if (
        index !== -1 &&
        index < state.constructorItems.ingredients.length - 1
      ) {
        const ingredient = state.constructorItems.ingredients[index];
        state.constructorItems.ingredients.splice(index, 1);
        state.constructorItems.ingredients.splice(index + 1, 0, ingredient);
      }
    },

    clearConstructorItems: (state) => {
      state.constructorItems = {
        bun: null,
        ingredients: []
      };
    }
  },

  selectors: {
    getBuns: (state) =>
      state.ingredients.filter((ingredient) => ingredient.type === 'bun'),

    getMains: (state) =>
      state.ingredients.filter((ingredient) => ingredient.type === 'main'),

    getSauces: (state) =>
      state.ingredients.filter((ingredient) => ingredient.type === 'sauce')
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchIngredients.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isInit = true;
        state.ingredients = payload;
      })
      .addCase(fetchIngredients.rejected, (state) => {
        state.isLoading = false;
        state.isInit = true;
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
