import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { currencyFormat } from "../../../utils/number";

const ProductCard = ({ item }) => {
  const navigate = useNavigate();

  const goToDetailPage = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <Card onClick={goToDetailPage} style={{ cursor: "pointer" }}>
      <Card.Img variant="top" src={item.image} />
      <Card.Body>
        <Card.Title>{item.name}</Card.Title>
        <Card.Text>₩ {currencyFormat(item.price)}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
