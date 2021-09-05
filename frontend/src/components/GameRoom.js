import React, { Component } from 'react'
import {useLocation} from "react-router-dom";

export default class GameRoom extends Component {
    state = {
        data : null,
        guest: null,
        url: window.location.pathname
    };

    componentDidMount = async () => {
        try{
            const backendResp = await this.callBackendAPI();
            if(backendResp.error){
                this.setState({data: backendResp.error})
            } else {
                this.setState({guest: backendResp.valid[0].guest})
                //Creation of Websocket connection:
                const socket = new WebSocket("ws:"+(window.location.href).split(':')[1]+':5000');


                socket.onopen = () => {

                    if( !(this.state.guest) ){ //If admin
                        this.setState({data: 'Waiting for opponent!'})
                    } else {
                        console.log('guest queried')
                        socket.send(JSON.stringify({
                            query_type: 'guest_join',
                            room_id: (window.location.pathname).slice(6)
                        }))
                    }
                
                }

                socket.onmessage = (response) => {
                    console.log(response);
                }


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
