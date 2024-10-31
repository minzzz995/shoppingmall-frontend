import React, { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../features/product/productSlice";
import ReactPaginate from "react-paginate";

const LandingPage = () => {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.product.productList);
  const totalPageNum = useSelector((state) => state.product.totalPageNum);
  const loading = useSelector((state) => state.product.loading);
  const [query] = useSearchParams();
  const name = query.get("name") || "";
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch product list with pagination
    dispatch(getProductList({ name, page: currentPage }));
  }, [name, currentPage]);

  const handlePageClick = (selectedPage) => {
    setCurrentPage(selectedPage.selected + 1); // ReactPaginate pages are 0-indexed
  };

  return (
    <Container>
      {loading ? (
        <div className="text-align-center">
          <Spinner animation="border" /> Loading products...
        </div>
      ) : (
        <>
          <Row>
            {productList.length > 0 ? (
              productList.map((item) => (
                <Col md={3} sm={12} key={item._id}>
                  <ProductCard item={item} />
                </Col>
              ))
            ) : (
              <div className="text-align-center empty-bag">
                {name === "" ? (
                  <h2>등록된 상품이 없습니다!</h2>
                ) : (
                  <h2>{name}과 일치한 상품이 없습니다!</h2>
                )}
              </div>
            )}
          </Row>

          {/* Pagination Controls */}
          <ReactPaginate
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            // pageCount={100}
            pageCount={totalPageNum}
            forcePage={currentPage - 1}
            previousLabel="< previous"
            renderOnZeroPageCount={null}
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
            className="display-center list-style-none"
          />
        </>
      )}
    </Container>
  );
};

export default LandingPage;
