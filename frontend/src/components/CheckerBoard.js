import React, { Component } from 'react'
import { CSSProperties } from './CheckerBoard.css'
import BlackTilePNG from '../graphics/black_tile.png'
import WhiteTilePNG from '../graphics/white_tile.png'
import BlackPawn from '../graphics/black_pawn.png'
import RedPawn from '../graphics/red_pawn.png'
export default class CheckerBoard extends Component {
    
    renderTile = (tileColor, pawn) => {
        if(pawn === 0){ //If there is no pawn:
            return <div className={tileColor ? 'black_tile' : 'white_tile'} >
            </div>
        } else if(pawn === 1){
            return <div className={tileColor ? 'black_tile' : 'white_tile'}>
                <div className='pawn'> <img className='pawn_img' src={BlackPawn}/> </div>
            </div>       
        } else if(pawn === 2){
            return <div className={tileColor ? 'black_tile' : 'white_tile'}>
                <div className='pawn'> <img className='pawn_img' src={RedPawn}/> </div>
            </div>       
        }        

    }


    render() {
        return (
            <div className='grid-container'>
                {this.props.gameData.map((elm,index)=>{

                    if(Math.floor(index/8)+1 & 1){
                        if(index & 1){
                            return this.renderTile(1,parseInt(elm))
                        } else { 
                            return this.renderTile(0,parseInt(elm))
                        }
                    } else{
                        if(index+1 & 1){
                            return this.renderTile(1,parseInt(elm))
                        } else { 
                            return this.renderTile(0,parseInt(elm))
                        }
                    }

                }

                ) } 
            </div>
        )
    }
}
