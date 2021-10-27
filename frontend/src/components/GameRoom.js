import React, { Component } from 'react'
import {useLocation} from "react-router-dom";
import CheckerBoard from './CheckerBoard';
import { CSSProperties } from './GameRoom.css'

export default class GameRoom extends Component {
    state = {
        userResponseData : null,
        initReq: 1,
        guest: null,
        g_auth: null,
        boardInversed: false,
        gameBoard: null,
        url: window.location.pathname
    };

    componentDidMount = async () => {
        try{
            const backendResp = await this.callBackendAPI();
            // If backend Response is an error, simply throw error onto screen (via data state)
            if(backendResp.error){
                this.setState({userResponseData: backendResp.error})
            //If there is no error, 
            } else {
                this.setState({guest: [backendResp.valid.guest,backendResp.valid.fta] })
                if(backendResp.valid.gameBoard){
                    this.setState({gameBoard : backendResp.valid.gameBoard}); //g_auth: Is guest here?

                }
                //Creation of Websocket connection:
                const socket = new WebSocket("ws:"+(window.location.href).split(':')[1]+':5000');


                socket.onopen = () => {
                    console.log(this.state.guest);
                    if( this.state.guest[0] === false ){ //If admin
                        if(this.state.gameBoard){
                            this.setState({userResponseData: `you're opponent is here!`})
                        } else {

                            this.setState({userResponseData: 'Waiting for opponent...'}) 
                        }

                    } else { //If guest:
                        this.setState({gameBoard: (this.state.gameBoard).reverse(), boardInversed: true })
                        if( this.state.guest[1] === true){ //If FTA is true
                            console.log('GUEST FIRST TIME AUTH')
                            socket.send(JSON.stringify({
                                query_type: 'guest_fta',
                                room_id: (window.location.pathname).slice(6)
                            })) 
                            this.setState({guest: [this.state.guest[0], false] })
                        } else {
                            this.setState({userResponseData: 'Welcome back, guest'})
                        }
                    }
                
                }

                socket.onmessage = (response) => {
                    console.log(response);
                    const respData = JSON.parse(response.data);

                    if(this.state.guest[0] === false){ //If admin:
                        if(respData.guest_auth === true){
                            this.setState({userResponseData: 'Guest has arrived!', gameBoard: respData.game_board});
                        }    
                    } else { //If guest:

                    }

                }


            }
            console.log(backendResp);
        } catch(err){
            console.log(err);
        }
    } //End of componentDidMount
    
    callBackendAPI = async () => {
        const response = await fetch(this.state.url);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
      };
    
    renderBoard = () => {
        if(this.state.gameBoard){
        return(
            <CheckerBoard gameData = {this.state.gameBoard} gameInversed = {this.state.boardInversed}/>
        )
        }
    };


    render() {
        return (
            <div className="main">
                {this.renderBoard()}
                
                <p className="welcome">Welcome to your checkers game! {this.state.userResponseData}</p>

            </div>
        )
    }
}
