import React, { Component } from 'react'
import {useLocation} from "react-router-dom";

export default class GameRoom extends Component {
    state = {
        data : null,
        url: window.location.pathname
    };

    componentDidMount = async () => {
        try{
            const backendResp = await this.callBackendAPI();
            if(backendResp.error){
                this.setState({data: backendResp.error})
            } else {
                this.setState({data: backendResp.valid})
            }
            console.log(backendResp);
        } catch(err){
            console.log(err);
        }
    }
    
    callBackendAPI = async () => {
        const response = await fetch(this.state.url);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
      };

    render() {
        return (
            <div>
                Welcome to your game! {this.state.data}

            </div>
        )
    }
}
