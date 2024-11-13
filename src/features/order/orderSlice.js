import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQty } from "../cart/cartSlice";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";
import { clearCartCount } from "../cart/cartSlice"; 

// Define initial state
const initialState = {
  orderList: [],
  orderNum: "",
  selectedOrder: {},
  error: "",
  loading: false,
  totalPageNum: 1,
};

// Async thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/order", payload);
      if (response.status !== 200) throw new Error(response.error);
      dispatch(clearCartCount());
      return response.data.orderNum;
    } catch (error) {
      dispatch(showToastMessage({ message: error.error, status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

// 주문 목록 가져오기
export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (_, { rejectWithValue }) => {
      try {
          const response = await api.get("/order"); // 서버에서 주문 목록 가져오기
          if (response.status !== 200) throw new Error(response.error);
          return response.data.data; // 주문 목록 데이터 반환
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/order/all", { params: query }); // 전체 주문 목록 API 호출
      if (response.status !== 200) throw new Error(response.error);
      return { data: response.data.data, totalPageNum: response.data.totalPageNum };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 주문 상태 업데이트 액션 추가
export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put("/order/update-status", { id, status });
      if (response.status !== 200) throw new Error(response.data.error);
      
      dispatch(showToastMessage({ message: "Status updated successfully", status: "success" }));
      return response.data.data;
    } catch (error) {
      dispatch(showToastMessage({ message: "Failed to update status", status: "error" }));
      return rejectWithValue(error.message);
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
    })
    .addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
      state.orderNum = action.payload;
    })
    .addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(getOrder.pending, (state) => {
      state.loading = true;
      state.error = "";
    })
    .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = action.payload; // 서버에서 가져온 주문 목록 저장
    })
    .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })
    .addCase(getOrderList.pending, (state) => {
      state.loading = true;
    })
    .addCase(getOrderList.fulfilled, (state, action) => {
      state.loading = false;
      state.orderList = action.payload.data; // 전체 주문 목록 저장
      state.totalPageNum = action.payload.totalPageNum; // 총 페이지 수 저장
    })    
    .addCase(getOrderList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(updateOrder.fulfilled, (state, action) => {
      const updatedOrder = action.payload;
      
      const index = state.orderList.findIndex(order => order._id === updatedOrder._id);
      if (index !== -1) {
        state.orderList[index] = updatedOrder;
      }

      state.selectedOrder = updatedOrder;
    })
    .addCase(updateOrder.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
