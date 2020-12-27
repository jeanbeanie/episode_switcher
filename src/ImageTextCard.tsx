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
  smallTitle?:boolean,
}

const StyledRow = styled(Row)`margin-top:1rem`;
const SubTitle = styled.p`opacity:.5;`;
const StyledImage = styled.img`max-width:100%;`;
const ImagePlaceholder = styled.div`background-color:grey; height:100%;color:white;text-align:center;font-size:3rem;`;


const ImageTextCard = (props: IProps) => {
  const {smallTitle, imageURL, imageAlt, title, subTitle, body} = props;
  return(
    <StyledRow>
      <Col xs="3">
        {
          imageURL ? 
          <StyledImage src={imageURL} alt={imageAlt}/>
            : <ImagePlaceholder>NA</ImagePlaceholder>
        }
      </Col>
      <Col xs="9">
        {
          smallTitle ?
          <h5>{title}</h5> : <h2>{title}</h2>
        }
        <SubTitle>{subTitle}</SubTitle>
        <p>{body}</p>
      </Col>
    </StyledRow>
  );
}

export default ImageTextCard;
