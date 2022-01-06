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
        url: window.location.pathname,
        turn: true,
    };


    AuthenticateUser = async () => {
        try{
            
            console.log('trying: '+this.state.url);
            //Call API
            const backendResp = await this.callBackendAPI();
            
            console.log(backendResp);

            //If Error, throw it
            if(backendResp.error){
                this.setState({userResponseData: backendResp.error})
                return
            }

            //Initially Setting the State:

            this.setState({guest: [backendResp.valid.guest,backendResp.valid.fta] })

            // WS Connection:
            const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

            const socket = new WebSocket(socketProtocol+(window.location.href).split(':')[1]+':5000');

            socket.onopen = () => {
                if( backendResp.valid.guest === false ){ //If admin

                    this.setState({
                        userResponseData : this.state.gameBoard ? `your opponent is here` : 'Waiting for opponent... '
                    });
                    
                } else { //If guest:

                    if( this.state.guest[1] === true){ //If FTA is true
                        console.log("It's your first time Authenticating!")
                        socket.send(JSON.stringify({
                            query_type: 'guest_fta',
                            room_id: (window.location.pathname).slice(6)
                        }));

                        this.setState({guest: [this.state.guest[0], false] }) //Falisfies FTA state
                        window.location.reload(false); //There is probably a better way to fix this
                     } 
                    this.setState({userResponseData: 'Welcome back, guest'})
                    
                }
            
            }

            
            socket.onmessage = (response) => {
                console.log("Something came in");

                const socketData = JSON.parse(response.data);


                if(socketData.action_type === 'movementResult'){
                    console.log('RESULT : ');
                    console.log(socketData.turn);
                    this.setState({gameBoard : socketData.game_board, turn: socketData.turn});
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
            console.log(err) //Handle Error by throwing it as string in console
        }
    }



    componentDidMount = async () => {
    await this.AuthenticateUser();    
    } //End of componentDidMount
    
    callBackendAPI = async () => {
        const response = await fetch(
            'http://localhost:5000'+this.state.url, {
                credentials: 'include'
              }
        );
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
                gameData : null,
                boardInv : this.state.guest[0] ? true : false
            }

            console.log('GAME BOARD');
            console.log(props.gameData);
            console.log('STATE BOARD');
            console.log(this.state.gameBoard);
            console.log(props.gameData === this.state.gameBoard ? 'true' : 'false');



            if(this.state.guest[0]){
            
            props.gameData = [...this.state.gameBoard].reverse();


            } 

            if(!this.state.guest[0]){
                props.gameData = [...this.state.gameBoard];
            }


            console.log(props)
        return(
            <CheckerBoard {...props}/>
        )
        }
    };



    render() {

        if(this.state.guest){
            console.log('loaded in ! ' + this.state.guest);
            //              Put into return statement for DEBUG     {this.state.turn ? "TRUE" : "FALSE"} 
            return (
                <div className="main">
                    {this.renderBoard()}
                    
                    <p className="welcome"> 

                    {
                    this.state.guest[0] ? (this.state.turn ? "It's your opponent's turn." : "It's your turn, move!") : (this.state.turn ? "It's your turn, move!" : "It's your opponent's turn.")
                    
                    }</p>
    
                </div>
            )
        }

        return (
            <div className="main">
                {this.renderBoard()}
                
                <p className="welcome"> {this.state.turn ? "TRUE" : "FALSE"} Loading {this.state.userResponseData}</p>

            </div>
        )
    }
}
