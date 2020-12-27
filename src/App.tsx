import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import ImageTextCard from './ImageTextCard';
import TitleWithSubTitle from './TitleWithSubTitle';

// TODO
// strip html from raw text
// make thumbnailWithSummary component

// API ENDPOINTS
const API_ROOT = 'http://api.tvmaze.com/';
const returnShowEndpoint = (showName:string) => `${API_ROOT}search/shows?q=${showName}`;
const returnShowEpisodesEndpoint = (showName:string) => `${API_ROOT}singlesearch/shows?q=${showName}&embed=episodes`;
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
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [replacementShow, setReplacementShow] = useState("");

  const returnSanitizedEpisode = (episode: IRawEpisode): IEpisode => {
    return { 
      premiereDate: episode.airdate, 
      name: episode.name, 
      seasonNumber: episode.season, 
      episodeNumber:episode.number, 
      id: episode.id, 
      summary: episode.summary, 
      imageURL: episode.image?.medium,
    }
  };

  const returnSanitizedEpisodes = (episodes: IRawEpisode[]) => {
    return episodes.map((episode): IEpisode => returnSanitizedEpisode(episode));
  }
  
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
      const fetchedEpisodes = returnSanitizedEpisodes(episodesResult.data);

      
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
  
  const findEpisodesIndexBySeason = (seasonNumber: number) => episodes.findIndex((ep) => ep[0] && ep[0].seasonNumber === seasonNumber)

  const handleSubmit = (event: any) => {
    event.preventDefault();
    async function returnReplacementEpisode () {
      const results = await axios(`${returnShowEpisodesEndpoint(replacementShow)}`);
      const replacementEpisode = returnSanitizedEpisode(results.data._embedded.episodes.find((episode: IRawEpisode) => {
        return episode.season === selectedSeason && episode.number === selectedEpisode
      }));
      const updatedEpisodes = [...episodes];
      updatedEpisodes[findEpisodesIndexBySeason(selectedSeason)][selectedEpisode-1] = replacementEpisode
      setEpisodes(updatedEpisodes);
    }
    returnReplacementEpisode();
  }

  const {name, summary, premiereDate, imageURL} = show;
  return (
    <>
    <Navbar bg="dark" variant="dark"><Navbar.Brand>Episode Switcher</Navbar.Brand></Navbar>
    <Container>
       
      <ImageTextCard
        imageURL={imageURL}
        imageAlt={`${name} cover`}
        title={name}
        subTitle={`Premiered on ${premiereDate}`}
        body={summary}
      />
      <form onSubmit={handleSubmit}>
        Replace 
        <select value={selectedSeason} onChange={(e)=>setSelectedSeason(parseInt(e.target.value))}>
          {
            seasons.map((season) => <option value={season.number}>Season {season.number}</option>)
          }
        </select>
          <select onChange={(e)=>setSelectedEpisode(parseInt(e.target.value))}>
            {
              findEpisodesIndexBySeason(selectedSeason) >= 0 &&
            episodes[findEpisodesIndexBySeason(selectedSeason)].map((episode) => <option value={episode.episodeNumber}>Episode {episode.episodeNumber}</option>)
          }
        </select>
          with <input type="text" onChange={(e) => setReplacementShow(e.target.value)}/>
          <input type="submit" value="Replace"/>
      </form>
      {
        seasons.map((season) => {
          const episodesIndex = episodes.findIndex((ep) => ep[0] && ep[0].seasonNumber === season.number)
          return (<>
            <TitleWithSubTitle
              title={`Season ${season.number}`}
              subTitle={`${season.numEpisodes} episodes | Aired ${season.premiereDate}`}
            />
              { 
                episodesIndex >= 0 && episodes[episodesIndex].map((episode) => {
                  return( 
                    <ImageTextCard
                      imageURL={episode.imageURL}
                      imageAlt={`${episode.seasonNumber}-${episode.episodeNumber}-cover`}
                      title={episode.name}
                      subTitle={`Season ${episode.seasonNumber} | Episode ${episode.episodeNumber} | ${episode.premiereDate}`}
                      body={episode.summary}
                      smallTitle
                    />
                  )
                })
              }
            </>);
          }
        )
      }
      </Container>
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
        integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
        crossOrigin="anonymous"
      />
    </>
  );
}

export default App;
