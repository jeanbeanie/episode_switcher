import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

// API ENDPOINTS
const API_ROOT = 'http://api.tvmaze.com/';
const returnShowEndpoint = (showName:string) => `${API_ROOT}search/shows?q=${showName}`;
const returnSeasonsEndpoint = (showID:number) => `${API_ROOT}shows/${showID}/seasons`; 
const returnEpisodesEndpoint = (seasonID:number) => `${API_ROOT}seasons/${seasonID}/episodes`;


// INTERFACES
//
interface IShowState {
  id: number,
  name: string,
  summary: string,
  premiereDate: string,
  imageURL: string,
}

interface IEpisode {
  seasonNumber : number,
  episodeNumber : number,
  summary: string,
  name: string,
  imageURL: string,
  id: number,
}

interface IRawEpisode {
  name: string,
  id: number,
  season: number,
  number: number,
  image: { medium: string},
  summary: string,
}

interface IRawSeason {
  id: number,
  number: number,
    premiereDate: string,
    episodeOrder: number,
}

interface ISeason {
  id: number,
  number: number,
  numEpisodes: number,
  premiereDate: string,
  episodes: IEpisode[],
}

function App() {
  const defaultShow : IShowState = {id:0, name:"", summary:"", premiereDate:"", imageURL:""};
  const defaultSeason : ISeason = {id:0, number:1,  numEpisodes:0, premiereDate:"", episodes:[]};
  const defaultEpisode : IEpisode = {id:0, seasonNumber:1, episodeNumber:1, summary:"", name:"", imageURL:""};
  const [show, setShow] = useState(defaultShow);
  const [seasons, setSeasons] = useState([defaultSeason]);
  const [episodes, setEpisodes] = useState([[defaultEpisode]]);

  useEffect(() => {
    const showName = "girls" // TODO
    

    async function fetchShowData () {
      const showResult = await axios(returnShowEndpoint(showName));
      const fetchedShow = showResult.data[0].show;
      const {id, name, summary, premiered, image} = fetchedShow;
      const showState = {
        id,
        name,
        summary,
        premiereDate: premiered,
        imageURL: image.medium,
      }
      setShow(showState);
      const seasonsResult = await axios(returnSeasonsEndpoint(showState.id));
      const fetchedSeasons = seasonsResult.data;
      const seasonIds: number[] = [];
      const seasons = fetchedSeasons.map((season: IRawSeason) => {
        seasonIds.push(season.id);
        return {
          id: season.id,
          number: season.number,
          premiereDate: season.premiereDate,
          numEpisodes: season.episodeOrder,
        }
      });
      setSeasons(seasons);
    }

    fetchShowData();
  },[]);
  
  console.log('Show STATE', show)
  console.log('Seasons STATE', seasons)
  console.log('Episodes STATE', episodes)
  const {name, summary, premiereDate, imageURL} = show;
  return (
    <div className="App">
      <h1>{name}</h1>
      <h2>Premiered on {premiereDate}</h2>
      <img src={imageURL} alt={`${name} cover`}/>
      <p>{summary}</p>
      {
          seasons.map((season) =>
            <>
          <h1>Season {season.number}</h1>
          <h2>{season.numEpisodes} episodes | Aired {season.premiereDate}</h2>
            </>
        )
      }
    </div>
  );
}

export default App;
