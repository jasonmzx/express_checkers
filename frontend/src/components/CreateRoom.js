import React, { Component } from 'react'
import {Link,Redirect, BrowserRouter as Router,} from "react-router-dom";

export default class CreateRoom extends Component {

    state = {
        redirect: null
    }



    inputHandler = (e) => {
        this.setState({room_input: e.target.value});
    }

    submitHandler = async () => {
        console.log(this.state.room_input);
        
        const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

        const socket = new WebSocket(socketProtocol+(window.location.href).split(':')[1]+':5000');

        socket.onopen = () => {
            socket.send(
            JSON.stringify({
                query_type: 'create_room',
                room_name : this.state.room_input,
            })
                )
        } 
        
        socket.onmessage = (response) => {
            const respData = JSON.parse(response.data);
            if(respData.room_url){
                this.setState({redirect: '/game/'+respData.room_url})
            }
            console.log(this.state.redirect);
        }
    }

    renderRedirect = () => {
        if (this.state.redirect) {
          return <Redirect to={this.state.redirect} />
        }
      }


//<Link to={ '/game/'+this.state.room_id} onClick={this.submitHandler}>Submit</Link>
    render() {
        return (
            <div>
                {this.renderRedirect()}
                  <label for="room_name">room's Name</label>
                <input type="text" id="room_name" onChange={this.inputHandler}></input> 
                <button onClick={this.submitHandler}>submit</button> 
            </div>
        )
    }
}
