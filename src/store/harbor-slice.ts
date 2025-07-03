import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface HarborValue {
  label: string;
  value: string;
}

interface HarborState {
  harbors: HarborValue[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export type Harbor = {
  id_pelabuhan: string;
  nama_pelabuhan: string;
  id_negara: string;
}

const initialState: HarborState = {
  harbors: [],
  status: 'idle',
  error: null
};

export const fetchHarbors = createAsyncThunk(
  'harbors/fetchHarbors',
  async (params: { filter?: string } = {}) => {
    const { filter = '' } = params;
    let apiUrl = 'http://202.157.176.100:3001/pelabuhans';

    // Always apply a filter, but make it case-insensitive and allow partial matches
    // If filter is empty, it will match all harbors
    if (apiUrl) {
      apiUrl += `?filter={"where": {"nama_pelabuhan": "${filter}"}}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch harbors');
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : [];

    // Clean the data to remove invalid entries
    const finalFilteredResults = results.filter((harbor: Harbor) => {
      return harbor.nama_pelabuhan &&
        harbor.nama_pelabuhan.toLowerCase() !== 'string' &&
        /^[a-zA-Z\s]+$/.test(harbor.nama_pelabuhan); // Only letters and spaces
    });

    // Map to the expected format
    return finalFilteredResults.map((harbor: Harbor) => ({
      label: harbor.nama_pelabuhan,
      value: harbor.id_negara.toString(),
    }));
  }
);

export const harborSlice = createSlice({
  name: 'harbors',
  initialState,
  reducers: {
    clearHarbors: (state) => {
      state.harbors = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHarbors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHarbors.fulfilled, (state, action: PayloadAction<HarborValue[]>) => {
        state.status = 'succeeded';
        state.harbors = action.payload;
        state.error = null;
      })
      .addCase(fetchHarbors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch harbors';
      });
  }
});

export const { clearHarbors } = harborSlice.actions;

export const selectHarbors = (state: RootState) => state.harbors.harbors;
export const selectHarborsStatus = (state: RootState) => state.harbors.status;
export const selectHarborsError = (state: RootState) => state.harbors.error;

export default harborSlice.reducer;
