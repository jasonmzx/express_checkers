import React, { Component } from 'react'
import {Link,Redirect, BrowserRouter as Router,} from "react-router-dom";
import { CSSProperties } from './GameRoom.css'


import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class CreateRoom extends Component {

    state = {
        redirect: null,
        roomNameLen: 0,
        turnTime : -1

    }



    inputHandler = (e) => {
        this.setState({roomNameLen: e.target.value.length, room_input: e.target.value});
    }

    typeHandler = (e) => {
        if(e.target.value === ''){
            this.setState({turnTime: -1}); //In seconds
            return
        }
        if( !(isNaN(e.target.value)) && parseInt(e.target.value) >= 15 && parseInt(e.target.value) <= 99 ){
            this.setState({turnTime : 1,time_input: parseInt(e.target.value)}); //Valid
        } else{
            this.setState({turnTime: 0}); //Inalid
        } 
        
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
                time_input : this.state.time_input
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
            <Container>
                <hr></hr>
                <Row>
                
            <Col>
                {this.renderRedirect()}
                  <h2>Room's name:</h2>

    <InputGroup className="mb-3">
    <FormControl
    onChange={this.inputHandler}
      placeholder="make this room's name easy & short"
      maxLength = "60"
      aria-label="Recipient's username"
      aria-describedby="basic-addon1"
    />
    <InputGroup.Text id="basic-addon1">{this.state.roomNameLen}/60</InputGroup.Text>
  </InputGroup>

  <h2>Time limit per turn:</h2>
    <InputGroup className="mb-3">
    <FormControl
    onChange={this.typeHandler}
      placeholder="please enter a positive integer ( 15 - 99 )"
      maxLength = "60"
      aria-label="Recipient's username"
      aria-describedby="basic-addon2"
    />
    <InputGroup.Text id="basic-addon2">{this.state.turnTime === -1 ? 'seconds' : (this.state.turnTime === 1 ? 'Valid ✔️' : 'Invalid ❌')}</InputGroup.Text>
  </InputGroup>

                <br></br><br></br>
                <Button onClick={this.submitHandler}>submit</Button> 
            </Col>
                </Row>

                <Row className="quote">

                    view all your options before making a choice

                </Row>
            </Container>
        )
    }
}
