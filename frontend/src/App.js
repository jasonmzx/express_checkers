import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Menu from './components/Menu';
import About from './components/About';
import CreateRoom from "./components/CreateRoom";
import GameRoom from "./components/GameRoom";
import {BrowserRouter as Router,Switch,Route} from "react-router-dom";

class App extends Component {
  state = {
    data: {error: 'loading...'},
    url: window.location.pathname,
  };

  //This will call the session manager
  componentDidMount = async () => {
        await this.callBackendAPI();
        console.log('Session loaded!')

}

callBackendAPI = async () => {
    console.log('App.js URL:');
    console.log(this.state.url);
    const response = await fetch('http://localhost:5000/sessionhandler', {
      credentials: 'include'
    });

    const body = await response.json();
    console.log(body);
    console.log(response.status);

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };




  render() {
    return (
      <Router>

      <Switch>
      <Route path='/menu'> <Menu /> </Route>
      <Route path='/aboutus'> <About /> </Route>
      <Route path='/createroom'> <CreateRoom /> </Route>
      <Route path='/game'> <GameRoom /></Route>
      </Switch>

      </Router>
    );
  }
}

export default App;
