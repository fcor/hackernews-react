import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import BouncingLoader from './Loading'

const default_query = 'redux';
const default_hpp = '100';
const path_base = 'https://hn.algolia.com/api/v1';
const path_search = '/search';
const param_search = 'query=';
const param_page = 'page=';
const param_hpp = 'hitsPerPage='


class App extends Component {

  _isMounted = false;

  constructor(props){
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: default_query,
      error: null,
      isLoading: false
    };
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm]
  }

  setSearchTopstories(result){
    const { hits, page } = result;
    const { searchKey, results } = this.state
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results:{
        ...results,
        [searchKey] : { hits: updatedHits, page }
      },
      isLoading: false
    })
  }

  fetchSearchTopstories(searchTerm, page = 0){
    this.setState({ isLoading: true })
    axios(`${path_base}${path_search}?${param_search}${searchTerm}&${param_page}${page}&${param_hpp}${default_hpp}`)
      .then(result => this._isMounted && this.setSearchTopstories(result.data))
      .catch(e => this._isMounted && this.setState({ error: e }));
  }

  componentDidMount(){
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  onDismiss(id){
    const { searchKey, results } = this.state
    const { hits, page } = results[searchKey]

    const isNotId = item => item.objectID !==id
    const updatedHits = hits.filter(isNotId)
    this.setState({
      result: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    })
  }

  onSearchChange(event){
    this.setState({
      searchTerm: event.target.value
    });
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm)
    }
    event.preventDefault()
  }

  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state;
    const page = results && results[searchKey] && results[searchKey].page || 0;
    const list = results && results[searchKey] && results[searchKey].hits || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value = {searchTerm}
            onChange = {this.onSearchChange}
            onSubmit = {this.onSearchSubmit}
          >
            Search!
          </Search>
        </div>
       { error
         ? <div className="interactions">
            <p>Something went wrong :(</p>
           </div>
         : <Table
            list = {list}
            onDismiss = {this.onDismiss}
           />
       }
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={value}
        onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
    </form>


const Table = ({list, onDismiss}) =>
    <div className="table">
      {list.map( item =>
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%'}}>
                <a href={item.url}> {item.title}</a>
              </span>
              <span style={{ width: '30%'}}>
                {item.author}
              </span>
              <span style={{ width: '10%'}}>
                {item.num_comments}
              </span>
              <span style={{ width: '10%'}}>
                {item.points}
              </span>
              <span style={{ width: '10%'}}>
                <Button
                  onClick={() =>
                    onDismiss(item.objectID)}
                    className="button-inline"
                  >
                  Dismiss
                </Button>
              </span>
            </div>
        )
      }
    </div>


const Button = ({onClick, className = '', children}) =>
      <button
        onClick = {onClick}
        className = {className}
        type = "button"
        >
        {children}
      </button>

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading
    ? <BouncingLoader />
    : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button)

export default App;

export {
  Button,
  Search,
  Table
}
