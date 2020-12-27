import React from 'react';
import styled from 'styled-components';

interface IProps {
  title: string,
  subTitle: string,
}
const StyledSubTitle = styled.p`opacity:.5;`;

const TitleWithSubTitle = (props:IProps) => {
  const {title, subTitle} = props;
  return(
    <>
    <h3>{title}</h3>
    <StyledSubTitle>{subTitle}</StyledSubTitle>
    <hr/>
    </>
  )
}

export default TitleWithSubTitle;
