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
  async (params: { filter?: string, countryId?: string } = {}) => {
    const { filter = '', countryId } = params;
    let apiUrl = 'http://202.157.176.100:3001/pelabuhans';

    const whereConditions: { [key: string]: string | undefined } = {};

    if (filter) {
      whereConditions.nama_pelabuhan = filter;
    }

    if (countryId) {
      whereConditions.id_negara = countryId;
    }

    // Hanya tambahkan parameter filter jika ada kondisi
    if (Object.keys(whereConditions).length > 0) {
      const filterObject = { where: whereConditions }; // Bungkus kondisi dalam objek 'where'
      const filterString = encodeURIComponent(JSON.stringify(filterObject));
      apiUrl += `?filter=${filterString}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch harbors');
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : [];

    const finalFilteredResults = results.filter((harbor: Harbor) => {
      return harbor.nama_pelabuhan &&
        harbor.nama_pelabuhan.toLowerCase() !== 'string' &&
        /^[a-zA-Z\s]+$/.test(harbor.nama_pelabuhan); // Only letters and spaces
    });

    const uniqueHarborsMap = new Map<string, HarborValue>();
    finalFilteredResults.forEach((harbor: Harbor) => {
      const harborValue: HarborValue = {
        label: harbor.nama_pelabuhan,
        value: harbor.id_pelabuhan.toString(),
      };
      uniqueHarborsMap.set(harbor.id_pelabuhan.toString(), harborValue);
    });

    return Array.from(uniqueHarborsMap.values());
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
