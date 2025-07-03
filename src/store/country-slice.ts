import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface CountryValue {
  label: string;
  value: string;
}

interface CountryState {
  countries: CountryValue[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export type Country = {
  id_negara: number;
  kode_negara: string;
  nama_negara: string;
}

const initialState: CountryState = {
  countries: [],
  status: 'idle',
  error: null
};

export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (params: { filter?: string } = {}) => {
    const { filter = '' } = params;
    let apiUrl = 'http://202.157.176.100:3001/negaras';

    // Always apply a filter, but make it case-insensitive and allow partial matches
    // If filter is empty, it will match all countries
    if (apiUrl) {
      apiUrl += `?filter={"where": {"nama_negara": "${filter}"}}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : [];

    // Clean the data to remove invalid entries
    const finalFilteredResults = results.filter((country: Country) => {
      return country.nama_negara &&
        country.nama_negara.toLowerCase() !== 'string' &&
        /^[a-zA-Z\s]+$/.test(country.nama_negara); // Only letters and spaces
    });

    // Map to the expected format
    return finalFilteredResults.map((country: Country) => ({
      label: country.nama_negara,
      value: country.id_negara.toString(),
    }));
  }
);

export const countrySlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    clearCountries: (state) => {
      state.countries = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<CountryValue[]>) => {
        state.status = 'succeeded';
        state.countries = action.payload;
        state.error = null;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch countries';
      });
  }
});

export const { clearCountries } = countrySlice.actions;

export const selectCountries = (state: RootState) => state.countries.countries;
export const selectCountriesStatus = (state: RootState) => state.countries.status;
export const selectCountriesError = (state: RootState) => state.countries.error;

export default countrySlice.reducer;
