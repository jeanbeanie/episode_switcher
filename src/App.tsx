import React, {useState, useEffect} from 'react';
import axios from 'axios';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ImageTextCard from './ImageTextCard';
import TitleWithSubTitle from './TitleWithSubTitle';
import ReplaceEpisodeForm from './ReplaceEpisodeForm';
import {IShowState, ISeason, IEpisode, IRawEpisode, IRawSeason} from './interfaces';

// API ENDPOINTS
const API_ROOT = 'http://api.tvmaze.com/';
const returnShowEndpoint = (showName:string) => `${API_ROOT}search/shows?q=${showName}`;
const returnShowEpisodesEndpoint = (showName:string) => `${API_ROOT}singlesearch/shows?q=${showName}&embed=episodes`;
const returnSeasonsEndpoint = (showID:number) => `${API_ROOT}shows/${showID}/seasons`; 
const returnEpisodesEndpoint = (seasonID:number) => `${API_ROOT}seasons/${seasonID}/episodes`;
const returnShowsEndpoint = (pageNum:number) => `${API_ROOT}shows?page=${pageNum}`

// Default State Values
const defaultShow : IShowState = {id:0, genre:"", name:"", summary:"", premiereDate:"", imageURL:""};
const defaultSeason : ISeason = {id:0, number:1,  numEpisodes:0, premiereDate:"", episodes:[]};
const defaultEpisode : IEpisode = {id:0, premiereDate:"", seasonNumber:1, episodeNumber:1, summary:"", name:"", imageURL:""};
       
const strippedString = (originalString: string) => originalString.replace(/(<([^>]+)>)/gi, "");
const returnRandomShowName = () => {
  async function fetchRandomShowName(pageNum: number, totalPages: number){
    const result = await axios(returnShowsEndpoint(pageNum))
    const randomResultIndex = Math.floor(Math.random() * Math.floor(totalPages-1));
    const showName = result.data[randomResultIndex] ? result.data[randomResultIndex].name : 'girls';
    return showName;
  }

  const TOTAL_API_PAGES = 210; // 210 pages, 250 results per page
  const RESULTS_PER_PAGE = 250;
  const randomPage = Math.floor(Math.random() * Math.floor(TOTAL_API_PAGES-1));
  return fetchRandomShowName(randomPage, RESULTS_PER_PAGE);
  // setShowName(fetchShows(randomPage));
};

function App():JSX.Element {

  const [dataIsLoaded, setDataIsLoaded] = useState(false);
  const [show, setShow] = useState(defaultShow);
  const [seasons, setSeasons] = useState([defaultSeason]);
  const [episodes, setEpisodes] = useState([[defaultEpisode]]);
  const [seasonIsLoaded, setSeasonIsLoaded] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [replacementShow, setReplacementShow] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showName, setShowName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const returnSanitizedEpisode = (episode: IRawEpisode): IEpisode => {
    return { 
      premiereDate: moment(episode.airdate).format('MMM. D, YYYY'), 
      name: episode.name, 
      seasonNumber: episode.season, 
      episodeNumber:episode.number, 
      id: episode.id, 
      summary: episode.summary ? `${strippedString(episode.summary).slice(0,269)}...` : '', 
      imageURL: episode.image?.medium ? episode.image.medium : '',
    }
  };

  const returnSanitizedEpisodes = (episodes: IRawEpisode[]) => {
    return episodes.map((episode): IEpisode => returnSanitizedEpisode(episode));
  }
  
  useEffect(() => {
    const episodeState:IEpisode[][] = [];

    // SINGLE SHOW DETAILS
    async function fetchShowData () {
      const randomShowName = await returnRandomShowName();
      if(!showName){
        setShowName(randomShowName);
        return;
      }
      const showResult = await axios(returnShowEndpoint(showName));
      const fetchedData = showResult.data;
      if(!fetchedData || !fetchedData[0] || !fetchedData[0].show){
        setErrorMessage(`There is no show matching '${searchInput}'.`);
        return;
      }

      const fetchedShow = fetchedData[0].show;

      const {id, genres, name, summary, premiered, image} = fetchedShow;
      const showState = {
        id,
        name,
        genre: genres ? genres[0] : '',
        summary: summary ? `${strippedString(summary).slice(0,699)}...` : '',
        premiereDate: moment(premiered).format('MMM. D, YYYY'),
        imageURL: image?.medium,
      }
      setShow(showState);

    // SEASONS DETAILS
    const seasonsResult = await axios(returnSeasonsEndpoint(showState.id));
    const fetchedSeasons = seasonsResult.data;
    const seasons = fetchedSeasons.map((season: IRawSeason) => {
      return {
        id: season.id,
        number: season.number,
        premiereDate: moment(season.premiereDate).format('MMM. D, YYYY'),
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
      setDataIsLoaded(true);
    }
  },[showName, seasonIsLoaded]);
  
  const findEpisodesIndexBySeason = (seasonNumber: number) => 
    episodes.findIndex((ep) => ep[0] && ep[0].seasonNumber === seasonNumber)

  const handleReplaceSubmit = (event: any) => {
    event.preventDefault();
    async function returnReplacementEpisode () {
      const results = await axios(`${returnShowEpisodesEndpoint(replacementShow)}`);
      const replacementEpisode = 
        returnSanitizedEpisode(results.data._embedded.episodes.find((episode: IRawEpisode) => {
        return episode.season === selectedSeason && episode.number === selectedEpisode
        }));
      const updatedEpisodes = [...episodes];
      updatedEpisodes[findEpisodesIndexBySeason(selectedSeason)][selectedEpisode-1] = replacementEpisode
      setEpisodes(updatedEpisodes);
    }
    setErrorMessage("");
    returnReplacementEpisode();
  }

  const handleSearchSubmit = (event:any) => {
    event.preventDefault();
    setErrorMessage("");
    setSeasonIsLoaded(false);
    setShowName(searchInput);
  }


  /* RENDER */

  const {name, genre, summary, premiereDate, imageURL} = show;
  if(dataIsLoaded){
    return (
      <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Episode Switcher</Navbar.Brand>
          <Form inline onSubmit={handleSearchSubmit}>
            <FormControl onChange={(e)=>setSearchInput(e.target.value)} 
              type="text" 
              placeholder="Enter a TV Show" 
            />
              <Button onClick={handleSearchSubmit} variant="secondary">Search</Button>
          </Form> 
        </Container>
          </Navbar>
      <Container>
        <ImageTextCard
          imageURL={imageURL}
          imageAlt={`${name} cover`}
          title={name}
          subTitle={`
            ${genre ? `${genre} | ` : ''}
            ${premiereDate ? `Premiered on ${premiereDate}` : 'In Development'}
          `}
          body={summary}
        />

        <ReplaceEpisodeForm
          submitCallback={handleReplaceSubmit}
          seasonChangeCallback={(e)=>setSelectedSeason(parseInt(e?.target?.value))}
          episodeChangeCallback={(e)=>setSelectedEpisode(parseInt(e.target.value))}
          showChangeCallback={(e) => setReplacementShow(e.target.value)}
          selectedSeason={selectedSeason}
          seasonOptions={seasons.map((season) => <option key={`season-${season.number}`} value={season.number}>Season {season.number}</option>)}
          episodeOptions={
              findEpisodesIndexBySeason(selectedSeason) >= 0 ?
              episodes[findEpisodesIndexBySeason(selectedSeason)].map((episode) => <option key={`ep-${episode.episodeNumber}`} value={episode.episodeNumber}>Episode {episode.episodeNumber}</option>)
              : undefined
          }
        />

        {errorMessage ? <Alert variant={"danger"}>{errorMessage}</Alert> : null}
        {
          seasons.map((season) => {
            const episodesIndex = findEpisodesIndexBySeason(season.number);
            const numEpisodesString = season.numEpisodes ? 
              `${season.numEpisodes} episodes | ` : episodes[episodesIndex] ? 
              `${episodes[episodesIndex].length} episodes | ` : '';
            return (<>
              <TitleWithSubTitle
                title={`Season ${season.number}`}
                subTitle={`${numEpisodesString} ${season.premiereDate ? `Aired ${season.premiereDate}` : ''}`}
              />
              { 
                episodesIndex >= 0 && episodes[episodesIndex].map((episode) => {
                  const {episodeNumber, seasonNumber, imageURL, premiereDate, summary} = episode;
                  return( 
                    <ImageTextCard
                      imageURL={imageURL}
                      imageAlt={`${seasonNumber}-${episodeNumber}-cover`}
                      title={episode.name}
                      subTitle={
                        `Season ${seasonNumber} | 
                        ${episodeNumber ? `Episode ${episodeNumber} | ` : ''}
                        ${premiereDate}`}
                      body={summary}
                      key={`${seasonNumber}-${episodeNumber}`}
                      smallTitle
                    />
                  )
                })
              }
            </>);
          })
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
  } else return <></>
}

export default App;
