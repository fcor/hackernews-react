import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const default_query = 'redux';
const default_hpp = '100';
const path_base = 'https://hn.algolia.com/api/v1';
const path_search = '/search';
const param_search = 'query=';
const param_page = 'page=';
const param_hpp = 'hitsPerPage='


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      result: null,
      searchTerm: default_query,
    };
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  setSearchTopstories(result){
    const { hits, page } = result;
    const oldHits = page !== 0
      ? this.state.result.hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      result: { hits: updatedHits, page }
    })
  }

  fetchSearchTopstories(searchTerm, page = 0){
    fetch(`${path_base}${path_search}?${param_search}${searchTerm}&${param_page}${page}&${param_hpp}${default_hpp}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e);
  }

  componentDidMount(){
    const { searchTerm } = this.state;
    this.fetchSearchTopstories(searchTerm);
  }

  onDismiss(id){
    const isNotId = item => item.objectID !==id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({
      result: { ...this.state.result, hits: updatedHits }
    });
  }

  onSearchChange(event){
    this.setState({
      searchTerm: event.target.value
    });
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state
    this.fetchSearchTopstories(searchTerm)
    event.preventDefault()
  }

  render() {
    const { searchTerm, result } = this.state;
    const page = (result && result.page) || 0;
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
        {result &&
         <Table
          list = {result.hits}
          onDismiss = {this.onDismiss}
          />
        }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopstories(searchTerm, page + 1)}>
            More
          </Button>
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

export default App;
