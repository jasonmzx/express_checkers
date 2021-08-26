import React, { Component } from 'react'
import {Link,BrowserRouter as Router,} from "react-router-dom";

export default class Menu extends Component {




    render() {
        return (
            <div>
                <p>This is the menu</p>
                <Link to="/aboutus">About</Link>
            </div>
        )
    }
}
