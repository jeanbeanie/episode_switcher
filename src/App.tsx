import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

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
    async function fetchData () {
      const result = await axios('http://api.tvmaze.com/search/shows?q=girls');
      console.log(result)
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
