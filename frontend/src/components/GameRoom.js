import React, { Component } from 'react'
import {useLocation} from "react-router-dom";

export default class GameRoom extends Component {
    state = {
        data : null,
        game_id: (window.location.pathname).split('/')[2] //Sub url
    };

    

    render() {
        return (
            <div>
                Welcome to your game! {this.props.backendAPIresp.error}

            </div>
        )
    }
}
