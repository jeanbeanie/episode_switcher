import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';

interface IProps {
  imageURL?: string,
  imageAlt?: string,
  title: string,
  subTitle: string,
  body: string,
}

const StyledRow = styled(Row)`margin-top:1rem`;


const ImageTextCard = (props: IProps) => {
  const {imageURL, imageAlt, title, subTitle, body} = props;
  return(
    <StyledRow>
      <Col xs="3">
        <img src={imageURL} alt={imageAlt}/>
      </Col>
      <Col xs="9">
        <h3>{title}</h3>
        <p>{subTitle}</p>
        <p>{body}</p>
      </Col>
    </StyledRow>
  );
}

export default ImageTextCard;
