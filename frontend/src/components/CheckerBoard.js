import React, { Component } from 'react'
import { CSSProperties } from './CheckerBoard.css'
import BlackTilePNG from '../graphics/black_tile.png'
import WhiteTilePNG from '../graphics/white_tile.png'
import BlackPawn from '../graphics/black_pawn.png'
import RedPawn from '../graphics/red_pawn.png'
export default class CheckerBoard extends Component {
    state = {
        gameBoard: this.props.gameData,
        gameInversed: this.props.boardInversed
    }

    pawnClick = (e) => {
        const pawnCoord = [ (e.target.id).split('-')[1] , (e.target.id).split('-')[2] ];
        const coord1D = parseInt(pawnCoord[0]*8)+parseInt(pawnCoord[1]);
        const newGame = [...this.state.gameBoard]
        newGame[coord1D] = 0;
        this.setState({gameBoard: newGame})
        console.log(this.state.gameBoard[coord1D]+ ' '+coord1D);

    }


    renderTile = (tileColor, pawn,coords) => {
        if(pawn === 0){ //If there is no pawn:
            return <div className={tileColor ? 'black_tile' : 'white_tile'} Id={'box-'+coords[0]+'-'+coords[1]}>
            </div>
        } else if(pawn === 1){
            return <div className={tileColor ? 'black_tile' : 'white_tile'} Id={'box-'+coords[0]+'-'+coords[1]}>
                <div className='pawn'> <img onClick={this.pawnClick} className='pawn_img' src={BlackPawn} Id={'pawn-'+coords[0]+'-'+coords[1]}/> </div>
            </div>       
        } else if(pawn === 2){
            return <div className={tileColor ? 'black_tile' : 'white_tile'} Id={'box-'+coords[0]+'-'+coords[1]}>
                <div className='pawn'> <img onClick={this.pawnClick} className='pawn_img' src={RedPawn} Id={'pawn-'+coords[0]+'-'+coords[1]}/> </div>
            </div>       
        }        

    }


    render() {
        return (
            <div className='grid-container'>
                {this.state.gameBoard.map((elm,index)=>{
                    const formatIndex = [
                        Math.floor(index/8), //col
                        index % 8 //row (modulo of grid)
                    ]

                    if(Math.floor(index/8)+1 & 1){
                        if(index & 1){
                            return this.renderTile(1,parseInt(elm),formatIndex)
                        } else { 
                            return this.renderTile(0,parseInt(elm),formatIndex)
                        }
                    } else{
                        if(index+1 & 1){
                            return this.renderTile(1,parseInt(elm),formatIndex)
                        } else { 
                            return this.renderTile(0,parseInt(elm),formatIndex)
                        }
                    }

                }

                ) } 
            </div>
        )
    }
}
