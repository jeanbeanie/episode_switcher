import React from 'react';

interface IProps {
  submitCallback: (event:any)=>void,
  seasonChangeCallback: (event:any)=>void,
  episodeChangeCallback: (event:any) =>void,
  seasonOptions: JSX.Element[],
  episodeOptions?: JSX.Element[],
  showChangeCallback: (event:any)=>void,
  selectedSeason: number,
}

const ReplaceEpisodeForm = (props: IProps) => {
  const {selectedSeason, submitCallback, seasonChangeCallback, episodeChangeCallback, seasonOptions,
    episodeOptions, showChangeCallback} = props;

  return(
    
      <form onSubmit={submitCallback}>
        Replace 
        <select value={selectedSeason} onChange={seasonChangeCallback}>
          {
            seasonOptions.map((option:JSX.Element) => option)
          }
        </select>
        <select onChange={episodeChangeCallback}>
          {
            episodeOptions && episodeOptions.map((option:JSX.Element) => option)
          }
        </select>
          with <input type="text" onChange={showChangeCallback}/>
          <input type="submit" value="Replace"/>
        </form>
  );
}

export default ReplaceEpisodeForm;
