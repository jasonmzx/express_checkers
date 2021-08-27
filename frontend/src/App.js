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
    data: null,
    url: window.location.pathname,
  };

  async componentDidMount() {
    try {
      const res = await this.callBackendAPI();
      this.setState({ data: res.express });
    } catch (err) {
      console.log("error");
    }
  }
  // fetching the GET route from the Express server which matches the GET route from server.js
  callBackendAPI = async () => {

    const response = await fetch(this.state.url);

    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
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
      <Route path='/game'> <GameRoom /> </Route>
      </Switch>

      </Router>
    );
  }
}

export default App;
