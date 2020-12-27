import React from 'react';

interface IProps {
  title: string,
  subTitle: string,
}

const TitleWithSubTitle = (props:IProps) => {
  const {title, subTitle} = props;
  return(
    <>
    <h3>{title}</h3>
    <p>{subTitle}</p>
    <hr/>
    </>
  )
}

export default TitleWithSubTitle;
