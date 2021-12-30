const vC = require('../validationConverter.js');
const converter = vC.Converter;

//kings -1, -2

const gameboard = [
    0,0,0,2,0,2,0,-2,  //  7
    2,0,2,0,0,0,1,0,  // 15
    0,2,0,0,0,0,0,0,  // 23
    0,0,0,0,0,0,2,0,  // 31
    0,0,0,1,0,0,0,0,  // 39
    1,0,0,0,1,0,2,0, // 47
    0,1,0,1,0,1,0,1, // 55
    0,0,1,0,1,0,1,0, // 63   
 ]

const displayBoard = (board) => {
    console.log(board);
    console.log('beginning:')

    for(let i = 0; i < 8; i++){
        console.log(board.slice( (i)*8 ,(i+1)*8 ).toString());
    }
}


const checkBoard = (board, pawnCoord, justKilled) => {
    if(!board[pawnCoord])
        return;
    
    let p = board[pawnCoord];
    let offsets
    if(p > 0){
        offsets = p & 1 ? [-7, -9] : [7, 9];
    } else {
        offsets = [-7,-9,7,9];
    }
    
    let res = [];
    let foundKill = false; //If this flag is negative after the for of loop, the recursion stops.
    for(let o of offsets){
        let checkSpot = pawnCoord + o;
        if( Math.abs( Math.floor(pawnCoord/8) - Math.floor(checkSpot/8)) === 1 && 0 <= checkSpot && checkSpot <= 63){
       // if(Math.floor(checkSpot/8) !== Math.floor(pawnCoord/8) && 0 <= checkSpot && checkSpot <= 63){
            if(board[pawnCoord + o] === 0 && !justKilled){
                res.push([o]);
                foundKill = true;
            }
            else if(Math.abs(board[pawnCoord + o]) === 3 - Math.abs(p) //Pawns need to be opposite
                    && board[pawnCoord + o * 2] === 0 //empty spot at destination
                    && Math.abs( Math.floor(pawnCoord/8) - Math.floor( (pawnCoord + o * 2)/8 ) ) === 2 //new Kill spot must be 2 rows away from og spot
                ){ //kill scenario
                foundKill = true;
                //edit board
                board[pawnCoord] = 0;
                let killed = board[pawnCoord + o];
                board[pawnCoord + o] = 0;
                board[pawnCoord + o * 2] = p;
                let tmp = checkBoard(board, pawnCoord + o * 2, true);
                for(let t of tmp){ t.unshift(o * 2) };
                res = res.concat(tmp);
                //revert board
                board[pawnCoord] = p;
                board[pawnCoord + o] = killed;
                board[pawnCoord + o * 2] = 0;
            }
        }
    }

    if(!foundKill){
        return [[]];
    }

    return res;
}

console.log('result:')
//console.log(checkBoard(gameboard,5))
console.log('?')


//console.log(converter(gameboard, checkBoard(gameboard,55),55,46 ));

//displayBoard(converter(gameboard, checkBoard(gameboard,55),55,1 ));


console.log(checkBoard(gameboard,7));
//console.log(checkBoard(gameboard,7));
//displayBoard(converter(gameboard, checkBoard(gameboard,14),14,56 ))

// module.exports = {
//     checkBoard
// }