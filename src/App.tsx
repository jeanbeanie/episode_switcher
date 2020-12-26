import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

// TODO
// strip html from raw text
// add bootstrap
// make thumbnailWithSummary component
// add form component for replacing episodes
// add callback for replacing episodes

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
    premiereDate: string,
}

interface IRawEpisode {
  name: string,
  id: number,
  season: number,
  number: number,
  image: { medium: string},
  summary: string,
  airdate: string,
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
const defaultShow : IShowState = {id:0, name:"", summary:"", premiereDate:"", imageURL:""};
const defaultSeason : ISeason = {id:0, number:1,  numEpisodes:0, premiereDate:"", episodes:[]};
const defaultEpisode : IEpisode = {id:0, premiereDate:"", seasonNumber:1, episodeNumber:1, summary:"", name:"", imageURL:""};
const showName = "girls" // TODO

function App() {
  const [show, setShow] = useState(defaultShow);
  const [seasons, setSeasons] = useState([defaultSeason]);
  const [episodes, setEpisodes] = useState([[defaultEpisode]]);
  const [seasonIsLoaded, setSeasonIsLoaded] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const episodeState:IEpisode[][] = [];

    // SINGLE SHOW DETAILS
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

    // SEASONS DETAILS
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
      setSeasonIsLoaded(true);
    }

    // EPISODES DATA
    //
    async function fetchEpisodesBySeason (seasonId: number) {
      const episodesResult = await axios(returnEpisodesEndpoint(seasonId));
      const fetchedEpisodes = episodesResult.data.map((episode:IRawEpisode): IEpisode => {
        return { 
          premiereDate: episode.airdate, 
          name: episode.name, 
          seasonNumber: episode.season, 
          episodeNumber:episode.number, 
          id: episode.id, 
          summary: episode.summary, 
          imageURL: episode.image?.medium,
        }
      });
      
      episodeState.push(fetchedEpisodes)
      setEpisodes(episodeState);
    }


    const buildEpisodeList = () => {
      return [seasons.map((season: ISeason) => {
        const seasonEpisodes = fetchEpisodesBySeason(season.id);
        return seasonEpisodes;
      })]
    }

    fetchShowData();
    if(seasonIsLoaded){
      buildEpisodeList();
    }
  },[seasonIsLoaded]);
  
  console.log('Show STATE', show)
  console.log('Seasons STATE', seasons)
  console.log('Episodes STATE', episodes)
  const findEpisodesIndexBySeason = (seasonNumber: number) => episodes.findIndex((ep) => ep[0] && ep[0].seasonNumber === seasonNumber)

  const {name, summary, premiereDate, imageURL} = show;
  return (
    <div className="App">

      <h1>{name}</h1>
      <h2>Premiered on {premiereDate}</h2>
      <img src={imageURL} alt={`${name} cover`}/>
      <p>{summary}</p>

      <div>
        Replace 
        <select value={selectedSeason} onChange={(e)=>setSelectedSeason(parseInt(e.target.value))}>
          {
            seasons.map((season) => <option value={season.number}>Season {season.number}</option>)
          }
        </select>
        <select>
          {
            episodes[findEpisodesIndexBySeason(selectedSeason)].map((episode) => <option value={episode.episodeNumber}>Episode {episode.episodeNumber}</option>)
          }
        </select>
        with <input type="text"/>
          <button>Replace</button>
      </div>
      {
        seasons.map((season) => {
          const episodesIndex = episodes.findIndex((ep) => ep[0] && ep[0].seasonNumber === season.number)
          return (<>
            <h1>Season {season.number}</h1>
            <h2>{season.numEpisodes} episodes | Aired {season.premiereDate}</h2>
            <hr/>
              { 
                episodesIndex >= 0 && episodes[episodesIndex].map((episode) => {
                  return( 
                    <>
                    <div>{episode.name}</div>
                    <div>Season {episode.seasonNumber} | Episode {episode.episodeNumber} | {episode.premiereDate}</div>
                    <img src={episode.imageURL} alt={`${episode.seasonNumber}-${episode.episodeNumber}-cover`}/>
                    <div>{episode.summary}</div>
                    </>
                  )
                })
              }
            </>);
          }
        )
      }
    </div>
  );
}

export default App;
