import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

interface IProps {
  imageURL?: string,
  imageAlt?: string,
  title: string,
  subTitle: string,
  body: string,
}

const ImageTextCard = (props: IProps) => {
  const {imageURL, imageAlt, title, subTitle, body} = props;
  return(
    <Row>
      <Col xs="3">
        <img src={imageURL} alt={imageAlt}/>
      </Col>
      <Col xs="9">
        <h3>{title}</h3>
        <p>{subTitle}</p>
        <p>{body}</p>
      </Col>
    </Row>
  );
}

export default ImageTextCard;
