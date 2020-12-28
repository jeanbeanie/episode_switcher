import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';

interface IProps {
  submitCallback: (event:any)=>void,
  seasonChangeCallback: (event:any)=>void,
  episodeChangeCallback: (event:any) =>void,
  seasonOptions: JSX.Element[],
  episodeOptions?: JSX.Element[],
  showChangeCallback: (event:any)=>void,
  selectedSeason: number,
}

const StyledSelect = styled.select`padding:0 1rem;margin: 0 1rem;`;
const StyledInput = styled.input`padding:0 1rem;margin: 0 1rem;`;
const StyledForm = styled(Form)`margin-top:2rem;margin-bottom:1rem`;
const StyledButton = styled(Button)`padding-left:2rem !important;padding-right:2rem !important;`;

const ReplaceEpisodeForm = (props: IProps):JSX.Element => {
  const {selectedSeason, submitCallback, seasonChangeCallback, episodeChangeCallback, seasonOptions,
    episodeOptions, showChangeCallback} = props;

  return(
      <Container>
      <StyledForm onSubmit={submitCallback}>
        <Row>
        Replace 
        <StyledSelect value={selectedSeason} onChange={seasonChangeCallback}>
          {
            seasonOptions.map((option:JSX.Element) => option)
          }
        </StyledSelect>
        <StyledSelect onChange={episodeChangeCallback}>
          {
            episodeOptions && episodeOptions.map((option:JSX.Element) => option)
          }
        </StyledSelect>
          with <StyledInput type="text" onChange={showChangeCallback}/>
            <StyledButton type="submit" value="Replace" variant="dark">Replace</StyledButton>
          </Row>
            </StyledForm>
              </Container>
  );
}

export default ReplaceEpisodeForm;
