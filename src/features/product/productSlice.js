import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/product", {params: {...query}});
      console.log("rrr", response)
      if (response.status !== 200) throw new Error(response.error);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      if (response.status !== 200) throw new Error(response.error);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
      if (response.status !== 200) throw new Error(response.error);

      dispatch(showToastMessage({ message: "상품 생성 완료", status: "success" }));
      dispatch(getProductList({page:1}))
      return response.data.data;
    } catch (error) {      
      return rejectWithValue(error.error);
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/product/${id}`, formData)
      if(response.status !== 200) throw new Error(response.error)
      
      dispatch(showToastMessage({ message: "상품 수정 완료", status: "success" }));
      dispatch(getProductList({page:1}))
      return response.data.data
    } catch(error) {
      return rejectWithValue(error.error);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      if (response.status !== 200) throw new Error(response.error);

      dispatch(showToastMessage({ message: "상품 삭제 완료", status: "success" }));
      dispatch(getProductList({ page: 1 })); // 삭제 후 첫 페이지를 다시 불러오기
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(createProduct.pending, (state) => {
      state.loading = true;
    })
    .addCase(createProduct.fulfilled, (state) => {
      state.loading = false;
      state.error = "";
      state.success = true;
    })
    .addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(getProductList.pending, (state) => {
      state.loading = true;
    })
    .addCase(getProductList.fulfilled, (state, action) => {
      state.loading = false;
      state.productList = action.payload.data || [];
      // state.error = "";
      state.totalPageNum=action.payload.totalPageNum;
    })
    .addCase(getProductList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(editProduct.pending, (state) => {
      state.loading = true;
    })
    .addCase(editProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.success=true
      state.error = "";
    })
    .addCase(editProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success=false
    })
    .addCase(getProductDetail.pending, (state) => {
      state.loading = true; // 로딩 시작
      state.error = "";
    })
    .addCase(getProductDetail.fulfilled, (state, action) => {
      state.loading = false; // 로딩 완료
      state.selectedProduct = action.payload; // 받아온 데이터 설정
    })
    .addCase(getProductDetail.rejected, (state, action) => {
      state.loading = false; // 로딩 완료
      state.error = action.payload || "Failed to load product details";
    });
  },  
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
