import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, size }, { rejectWithValue, dispatch, getState }) => {
    try {
      // 현재 장바구니 리스트 가져오기
      const currentCartList = getState().cart.cartList;

      // // 만약 현재 장바구니 리스트가 비어 있으면 `getCartList`를 호출하여 보충
      // if (currentCartList.length === 0) {
      //   await dispatch(getCartList());
      //   currentCartList = getState().cart.cartList; // 업데이트된 장바구니 리스트 가져오기
      // }

      // 동일한 상품 및 사이즈가 있는지 확인
      const isDuplicate = currentCartList.some(
        (item) => item.productId._id === id && item.size === size
      );

      if (isDuplicate) {
        // 동일한 상품이 존재하면 ToastMessage 띄우기
        dispatch(
          showToastMessage({ message: "이미 동일 상품이 장바구니에 있습니다.", status: "error" })
        );
        return rejectWithValue("Duplicate item exists");
      }

      // API 호출하여 아이템 추가
      const response = await api.post("/cart", { productId: id, size, qty: 1 });
      if (response.status !== 200) throw new Error(response.error);

      // 성공 메시지 및 cartItemQty 반환
      dispatch(showToastMessage({ message: "상품이 카트에 추가되었습니다.", status: "success" }));
      await dispatch(getCartList());

      return response.data.cartItemQty;
    } catch (error) {
      dispatch(showToastMessage({ message: "카트에 아이템 추가 실패", status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      if (response.status !== 200) throw new Error(response.error);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (itemId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      if (response.status !== 200) throw new Error(response.error);

      dispatch(showToastMessage({ message: "상품이 카트에서 삭제되었습니다.", status: "success" }));
      dispatch(getCartList()); // 카트 리스트와 카운트 업데이트
      return itemId;
    } catch (error) {
      dispatch(showToastMessage({ message: "카트 아이템 삭제 실패", status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ itemId, qty }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(`/cart/${itemId}/qty`, { qty });
      if (response.status !== 200) throw new Error(response.error);

      dispatch(getCartList()); // 카트 리스트 및 가격 갱신
      dispatch(showToastMessage({ message: "수량이 성공적으로 업데이트되었습니다.", status: "success" }));
      return response.data.data;
    } catch (error) {
      dispatch(showToastMessage({ message: "카트 아이템 수량 업데이트 실패", status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        // state.cartItemCount=action.payload;
        // state.cartItemCount += 1;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload;
        state.cartItemCount = action.payload.length;
        // state.cartItemCount = action.payload.reduce((total, item) => total + item.qty, 0);
        state.totalPrice=action.payload.reduce((total, item)=>total+item.productId.price*item.qty, 0)
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
