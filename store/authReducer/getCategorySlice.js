import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCategoryRequest = createAsyncThunk(
  'sub_category',
  async ({rejectWithValue}) => {
    const token = await AsyncStorage.getItem('userToken');

    try {
      const response = await axios.post(`${API_URL}/api/get_category`, {
        headers: {Authorization: 'Bearer ' + token},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const getCategorySlice = createSlice({
  name: 'sub_category',
  initialState: {
    category_data: [],
    loading_category: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getCategoryRequest.pending, state => {
        state.loading_category = true;
      })

      .addCase(getCategoryRequest.fulfilled, (state, action) => {
        if (action.payload?.status) {
          state.loading_category = false;
          state.category_data = action.payload?.category;
        }
      })

      .addCase(getCategoryRequest.rejected, (state, action) => {
        if (!action.payload?.status) {
          state.loading_category = false;
        }
      });
  },
});

export default getCategorySlice.reducer;
