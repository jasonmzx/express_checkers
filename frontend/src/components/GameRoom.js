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
        boardInversed: null,
        gameBoard: null,
        url: window.location.pathname
    };


    AuthenticateUser = async () => {
        try{
            
            //Call API
            const backendResp = await this.callBackendAPI();
            
            //If Error, throw it
            if(backendResp.error){
                this.setState({userResponseData: backendResp.error})
                return
            }

            //Initially Setting the State:

            this.setState({guest: [backendResp.valid.guest,backendResp.valid.fta] })

            // WS Connection:
            const socket = new WebSocket("ws:"+(window.location.href).split(':')[1]+':5000');

            socket.onopen = () => {
                if( backendResp.valid.guest === false ){ //If admin

                    this.setState({
                        userResponseData : this.state.gameBoard ? `your opponent is here` : 'Waiting for opponent... '
                    })
                    
                } else { //If guest:

                    if( this.state.guest[1] === true){ //If FTA is true
                        console.log("REACHING ?? ADMIN !!!")
                        socket.send(JSON.stringify({
                            query_type: 'guest_fta',
                            room_id: (window.location.pathname).slice(6)
                        }));

                        this.setState({guest: [this.state.guest[0], false] }) //Falisfies FTA state
                        return
                    } 
                    
                    this.setState({userResponseData: 'Welcome back, guest'})
                    
                }
            
            }

            
            socket.onmessage = (response) => {
                console.log("Something came in");

                const socketData = JSON.parse(response.data);


                if(socketData.action_type === 'movementResult'){
                    this.setState({gameBoard : socketData.game_board});
                    this.renderBoard();
                }

                if(!backendResp.valid.guest){ //If admin:
                    
                    if(socketData.guest_auth === true){
                        this.setState({userResponseData: 'Guest has arrived!', gameBoard: socketData.game_board});
                    }    
                } else { //If guest:

                }

            }

            if(backendResp.valid.gameBoard){
              
                this.setState({gameBoard : backendResp.valid.gameBoard}); 

            }

        } catch(err){
            console.log(err) //Handle Error by throwing it as text in console
        }
    }



    componentDidMount = async () => {
    await this.AuthenticateUser();    
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
            console.log('PROPS : ');
            let props = {
                gameData : this.state.guest[0] ? [...this.state.gameBoard.reverse()] : this.state.gameBoard,
                boardInv : this.state.guest[0] ? true : false
            }
            console.log(props)
        return(
            <CheckerBoard {...props}/>
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
