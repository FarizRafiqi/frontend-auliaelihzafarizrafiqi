import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface ItemValue {
  label: string;
  value: string;
  title: string;
  discount: number;
  price: number;
}

interface ItemState {
  items: ItemValue[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export type Item = {
  id_barang: number;
  nama_barang: string;
  id_pelabuhan: number;
  description: string;
  diskon: number;
  harga: number;
}

const initialState: ItemState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (params: { filter?: string } = {}) => {
    const { filter = '' } = params;
    let apiUrl = 'http://202.157.176.100:3001/barangs';

    // Always apply a filter, but make it case-insensitive and allow partial matches
    // If filter is empty, it will match all items
    if (filter) {
      apiUrl += `?filter={"where": {"nama_barang": "${filter}"}}`
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch barang');
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : [];

    // Clean the data to remove invalid entries
    const finalFilteredResults = results.filter((item: Item) => {
      return item.nama_barang &&
        item.nama_barang.toLowerCase() !== 'string' &&
        /^[a-zA-Z\s]+$/.test(item.nama_barang); // Only letters and spaces
    });

    // Use a Map to ensure unique ItemValue objects based on their 'value' (id_barang)
    const uniqueItemsMap = new Map<string, ItemValue>();
    finalFilteredResults.forEach((item: Item) => {
      const itemValue: ItemValue = {
        label: item.nama_barang,
        value: item.id_barang.toString(),
        title: item.description || '',
        discount: item.diskon ?? 0,
        price: item.harga ?? 0,
      };
      // If a duplicate id_barang is encountered, the new one will overwrite the old one,
      // effectively de-duplicating the list.
      uniqueItemsMap.set(item.id_barang.toString(), itemValue);
    });
    console.log(Array.from(uniqueItemsMap.values()), 'Unique Items');
    // Convert Map values back to an array
    return Array.from(uniqueItemsMap.values());
  }
);

export const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearItems: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<ItemValue[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch items';
      });
  }
});

export const { clearItems } = itemSlice.actions;

export const selectItems = (state: RootState) => state.items.items;
export const selectItemsStatus = (state: RootState) => state.items.status;
export const selectItemsError = (state: RootState) => state.items.error;

export default itemSlice.reducer;
