import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/login", {email, password})
      
      return response.data
    }catch(error){
      return rejectWithValue(error.error)
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {
    try { 
      const response = await api.post("/auth/google", { token });
      if (response.status === 200 && response.data.user && response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        return response.data; // user와 token 모두 반환
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      return rejectWithValue(error.message || error.response.data.error);
    }
  }
);

export const logout = () => (dispatch) => {
  sessionStorage.removeItem("token");
  dispatch(clearErrors());
  dispatch({ type: "user/logout" });
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user", {email, name, password})
      dispatch(showToastMessage({message:"회원가입 성공", status:"success"}))
      navigate("/login")

      return response.data.data
    } catch (error) {
      dispatch(showToastMessage({message:"회원가입 실패", status:"error"}))
      return rejectWithValue(error.error)
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me")
      return response.data
    } catch (error) {
      return rejectWithValue(error.error)
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state)=>{
      state.loading=true;
    })
    .addCase(registerUser.fulfilled, (state)=>{
      state.loading=false;
      state.registrationError=null
    })
    .addCase(registerUser.rejected, (state, action)=>{
      state.registrationError=action.payload
    })
    .addCase(loginWithEmail.pending, (state)=>{
      state.loading=true;
    })
    .addCase(loginWithEmail.fulfilled, (state, action)=>{
      state.loading=false;
      state.user = action.payload.user
      state.loginError=null

      sessionStorage.setItem("token", action.payload.token)
    })
    .addCase(loginWithEmail.rejected, (state, action)=>{
      state.loading=false;
      state.loginError=action.payload;
    })
    .addCase(loginWithToken.fulfilled, (state, action)=>{
      state.loading=false;
      state.user = action.payload.user
    })
    .addCase(loginWithToken.rejected, (state) => {
      state.user = null;
      sessionStorage.removeItem("token");
    })
    .addCase(loginWithGoogle.pending, (state) => {
      state.loading = true;
    })
    .addCase(loginWithGoogle.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user; // user 정보를 상태에 저장
      state.loginError = null;
    })
    .addCase(loginWithGoogle.rejected, (state, action) => {
      state.loading = false;
      state.loginError = action.payload;
    });
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
