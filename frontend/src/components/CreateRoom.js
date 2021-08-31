import React, { Component } from 'react'
import {Link,BrowserRouter as Router,} from "react-router-dom";

export default class CreateRoom extends Component {

    id_generator = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let ret = ''
        for (let i = 0; i < 5; i++) {
            ret += chars[Math.round(Math.random()*62)]
          }
        return ret
    }

    state = {
        room_id : this.id_generator()
    };



    inputHandler = (e) => {
        this.setState({room_input: e.target.value});
    }

    submitHandler = async () => {
        console.log(this.state.room_input);
        //const socket = new WebSocket('ws://localhost:5000');
        const socket = new WebSocket("ws:"+(window.location.href).split(':')[1]+':5000');
        socket.onopen = () => {
            socket.send(
            JSON.stringify({
                query_type: 'create_room',
                room_name : this.state.room_input,
                room_id : this.state.room_id
            })
                )
        }
    }

    render() {
        return (
            <div>
                  <label for="room_name">room's Name</label>
                <input type="text" id="room_name" onChange={this.inputHandler}></input>
                <Link to={ '/game/'+this.state.room_id} onClick={this.submitHandler}>Submit</Link>
            </div>
        )
    }
}
