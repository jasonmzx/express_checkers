import React, { Component } from 'react'
import {useLocation} from "react-router-dom";
import CheckerBoard from './CheckerBoard';

export default class GameRoom extends Component {
    state = {
        data : null,
        guest: null,
        g_auth: null,
        gameBoard: null,
        url: window.location.pathname
    };

    componentDidMount = async () => {
        try{
            const backendResp = await this.callBackendAPI();
            // If backend Response is an error, simply throw error onto screen (via data state)
            if(backendResp.error){
                this.setState({data: backendResp.error})
            //If there is no error, 
            } else {
                this.setState({guest: [backendResp.valid.guest,backendResp.valid.fta] })
                if(backendResp.valid.isGuest){
                    this.setState({g_auth : backendResp.valid.isGuest});
                }
                //Creation of Websocket connection:
                const socket = new WebSocket("ws:"+(window.location.href).split(':')[1]+':5000');


                socket.onopen = () => {
                    console.log(this.state.guest);
                    if( this.state.guest[0] === false ){ //If admin
                        if(this.state.g_auth){
                            this.setState({data: `you're opponent is here!`})
                        } else {
                            this.setState({data: 'Waiting for opponent...'}) 
                        }

                    } else { //If guest:
                        if( this.state.guest[1] === true){ //If FTA is true
                            console.log('GUEST FIRST TIME AUTH')
                            socket.send(JSON.stringify({
                                query_type: 'guest_fta',
                                room_id: (window.location.pathname).slice(6)
                            })) 
                            this.setState({guest: [this.state.guest[0], false] })
                        } else {
                            this.setState({data: 'Welcome back, guest'})
                        }
                    }
                
                }

                socket.onmessage = (response) => {
                    console.log(response);
                    const respData = JSON.parse(response.data);

                    if(this.state.guest[0] === false){ //If admin:
                        if(respData.guest_auth === true){
                            this.setState({data: 'Guest has arrived!', gameBoard: respData.game_board});
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
            <CheckerBoard gameData = {this.state.gameBoard} />
        )
        }
    };


    render() {
        return (
            <div>
                {this.renderBoard()}
                Welcome to your game! {this.state.data}

            </div>
        )
    }
}
