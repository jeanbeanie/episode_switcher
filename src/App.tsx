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

function App() {
  const defaultShow : IShowState = {id:0, name:"", summary:"", premiereDate:"", imageURL:""}
  const [show, setShow] = useState(defaultShow);
 
  useEffect(() => {
    const showName = "girls" // TODO
    async function fetchData () {
      const result = await axios(returnShowEndpoint(showName));
      console.log('RESULT', result)
      const fetchedShow = result.data[0].show;
      const {id, name, summary, premiered, image} = fetchedShow;
      const showState = {
        id,
        name,
        summary,
        premiereDate: premiered,
        imageURL: image.medium,
      }
      setShow(showState);
    }

    fetchData();
  },[]);
 

  console.log('SHOW STATE', show)
  return (
    <div className="App">
      <header className="App-header">
        Show: {show.name}
      </header>
    </div>
  );
}

export default App;
