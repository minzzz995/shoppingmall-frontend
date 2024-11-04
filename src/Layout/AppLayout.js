import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../common/component/Sidebar";
import Navbar from "../common/component/Navbar";
import ToastMessage from "../common/component/ToastMessage";
import { loginWithToken } from "../features/user/userSlice";
import { getCartList, initialCart } from "../features/cart/cartSlice";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user); // 로그인 상태 확인

  useEffect(() => {
    dispatch(loginWithToken());
  }, [dispatch]);

  // 로그인한 사용자의 장바구니 정보 가져오기
  useEffect(() => {
    if (user) {
      dispatch(getCartList());
    } else {
      dispatch(initialCart()); // 로그아웃 시 카트 초기화
      navigate("/login"); // 로그아웃 상태에서 로그인 페이지로 이동
    }
  }, [user, dispatch, navigate]);

  return (
    <div>
      <ToastMessage />
      {location.pathname.includes("admin") ? (
        <Row className="vh-100">
          <Col xs={12} md={3} className="sidebar mobile-sidebar">
            <Sidebar />
          </Col>
          <Col xs={12} md={9}>
            {children}
          </Col>
        </Row>
      ) : (
        <>
          <Navbar user={user} />
          {children}
        </>
      )}
    </div>
  );
};

export default AppLayout;
