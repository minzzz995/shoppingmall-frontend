import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { ColorRing } from "react-loader-spinner";
import { currencyFormat } from "../../utils/number";
import "./style/productDetail.style.css";
import { getProductDetail } from "../../features/product/productSlice";
import { addToCart } from "../../features/cart/cartSlice";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.product);
  const [size, setSize] = useState("");
  const { id } = useParams();
  const [sizeError, setSizeError] = useState(false);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const addItemToCart = () => {
    if (!size) {
      setSizeError(true); // 사이즈를 선택하지 않았으면 에러 표시
      return;
    }
    if (!user) {
      navigate("/login"); // 로그인하지 않은 유저는 로그인 페이지로 이동
    } else {
      // dispatch(addToCart({ id: selectedProduct._id, size })); // 장바구니에 상품 추가
      dispatch(addToCart({ id, size }));
    }
  };

  const selectSize = (value) => {
    if(sizeError) setSizeError(false);
    setSize(value);
    // setSizeError(false);
  };

  useEffect(() => {
    dispatch(getProductDetail(id));
  }, [id, dispatch]);

  if (loading || !selectedProduct) {
    return (
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    );
  }

  return (
    <Container className="product-detail-card">
      <Row>
        {/* 상품 이미지 */}
        <Col sm={6}>
          <img src={selectedProduct.image} className="w-100" alt={selectedProduct.name} />
        </Col>

        {/* 상품 정보 */}
        <Col className="product-info-area" sm={6}>
          <div className="product-info product-name">{selectedProduct.name}</div>
          <div className="product-info product-price">
            ₩ {currencyFormat(selectedProduct.price)}
          </div>
          <div className="product-info product-description">{selectedProduct.description}</div>

          {/* 사이즈 선택 Dropdown */}
          <Dropdown
            className="drop-down size-drop-down"
            title={size}
            align="start"
            onSelect={selectSize}
          >
            <Dropdown.Toggle
              className="size-drop-down"
              variant={sizeError ? "outline-danger" : "outline-dark"}
              id="dropdown-basic"
              align="start"
            >
              {size === "" ? "사이즈 선택" : size.toUpperCase()}
            </Dropdown.Toggle>

            <Dropdown.Menu className="size-drop-down">
              {Object.keys(selectedProduct.stock).map((item, index) =>
                selectedProduct.stock[item] > 0 ? (
                  <Dropdown.Item eventKey={item} key={index}>
                    {item.toUpperCase()}
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item eventKey={item} disabled key={index}>
                    {item.toUpperCase()} (품절)
                  </Dropdown.Item>
                )
              )}
            </Dropdown.Menu>
          </Dropdown>

          {/* 에러 메시지 */}
          <div className="warning-message">
            {sizeError && "사이즈를 선택해주세요."}
          </div>

          {/* 장바구니 추가 버튼 */}
          <Button variant="dark" className="add-button" onClick={addItemToCart}>
            장바구니에 추가
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
