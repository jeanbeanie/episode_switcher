
// INTERFACES
//
export interface IShowState {
  id: number,
  name: string,
  summary: string,
  premiereDate: string,
  imageURL: string,
}

export interface IEpisode {
  seasonNumber : number,
  episodeNumber : number,
  summary: string,
  name: string,
  imageURL: string,
    id: number,
    premiereDate: string,
}

export interface IRawEpisode {
  name: string,
  id: number,
  season: number,
  number: number,
  image: { medium: string},
  summary: string,
  airdate: string,
}

export interface IRawSeason {
  id: number,
  number: number,
    premiereDate: string,
    episodeOrder: number,
}

export interface ISeason {
  id: number,
  number: number,
    numEpisodes: number,
  premiereDate: string,
  episodes: IEpisode[],
}

