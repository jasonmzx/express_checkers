import React, { Component } from 'react'
import { CSSProperties } from './CheckerBoard.css'
import BlackTilePNG from '../graphics/black_tile.png'
import WhiteTilePNG from '../graphics/white_tile.png'
import BlackPawn from '../graphics/black_pawn.png'
import RedPawn from '../graphics/red_pawn.png'
import checker_validation from './validation/checker_validation'
export default class CheckerBoard extends Component {
    state = {
        gameBoard: this.props.gameData,
        boardInv : this.props.boardInv,
        dispBoard: null,
        dispOverlay : {},
    }

    //Overlay Initializer:

    //Whenever a pawn is clicked, this function executes:
        //This function executes the validation algorithm, then generates an overlay of all possible moves the user can make


    pawnClick = async (e) => {
        await this.setState({dispOverlay: {} });
        const coord1D = parseInt((e.target.id).split('-')[1]);
        const newGame = [...(this.state.gameBoard.map((e)=> {return parseInt(e)}))]


        console.log('PAWN CLICK DEBUG:');
        console.log('Game Board:');
        console.log(newGame);
        console.log('Coord 1D');
        console.log(coord1D);

        let valid = this.state.boardInv ? checker_validation.checkBoard(newGame.reverse(),63-coord1D) : checker_validation.checkBoard(newGame, coord1D);

        if(this.state.boardInv){
            valid = [...valid.map((e) => {return e.map( (j) => {return -1*j} )  })];
        }

        console.log('Validated: '+JSON.stringify(valid))
        for(let v of valid){
            if(Math.abs(v) < 14){
                let entry = this.state.dispOverlay
                entry[parseInt(coord1D)+parseInt(v)] = false
                
                this.setState({dispOverlay : entry});
                console.log(this.state.dispOverlay);
            }
        }
    }

    tileClick = async (e) => {
        const coord1D = parseInt((e.target.id).split('-')[1]);
    
        console.log('Tile has been clicked '+coord1D);
    }

    renderTile = (tileColor, pawn,coords) => {
        if(pawn === 0){ //If there is no pawn:
            return <div className={tileColor} Id={'box-'+coords}>
            </div>
        } else if(pawn === 1){
            return <div className={tileColor} onClick={this.tileClick} Id={'box-'+coords}>
                <div className='pawn'> <img onClick={this.pawnClick} className='pawn_img' src={BlackPawn} Id={'pawn-'+coords}/> </div>
            </div>       
        } else if(pawn === 2){
            return <div className={tileColor} Id={'box-'+coords}>
                <div className='pawn'> <img onClick={this.pawnClick} className='pawn_img' src={RedPawn} Id={'pawn-'+coords}/> </div>
            </div>       
        }
    }

    

    render() {
        return (
            <div>
            <div className='grid-container'>
                {this.state.gameBoard.map((elm,index)=>{
                    if( (Object.keys(this.state.dispOverlay)).includes(index.toString()) ){
                        if(this.state.dispOverlay[index]){
                            
                        }   else {
                            return this.renderTile('move_tile',parseInt(elm),index)
                        }          
                    }

                    if(Math.floor(index/8)+1 & 1){
                        if(index & 1){
                            return this.renderTile('black_tile',parseInt(elm),index)
                        } else { 
                            return this.renderTile('white_tile',parseInt(elm),index)
                        }
                    } else{
                        if(index+1 & 1){
                            return this.renderTile('black_tile',parseInt(elm),index)
                        } else { 
                            return this.renderTile('white_tile',parseInt(elm),index)
                        }
                    }

                }

                ) } 
            </div>
            <p>{this.state.boardInversed}</p>
            </div>
        )
    }
}
