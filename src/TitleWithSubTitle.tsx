import React from 'react';
import styled from 'styled-components';

interface IProps {
  title: string,
  subTitle: string,
}
const StyledSubTitle = styled.p`opacity:.5;`;
const StyledTitle = styled.h3`margin-top:2rem;`;

const TitleWithSubTitle = (props:IProps):JSX.Element => {
  const {title, subTitle} = props;
  return(
    <>
    <StyledTitle>{title}</StyledTitle>
    <StyledSubTitle>{subTitle}</StyledSubTitle>
    <hr/>
    </>
  )
}

export default TitleWithSubTitle;
