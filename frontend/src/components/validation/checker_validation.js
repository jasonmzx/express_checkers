// const gameboard = [
//     0,2,0,2,0,2,0,2, //7
//     2,0,2,0,2,0,2,0, //15
//     0,2,0,2,0,2,0,2,
//     0,0,0,0,0,0,0,0,
//     0,0,0,0,0,0,0,0,
//     1,0,1,0,1,0,1,0, // 47
//     0,1,0,1,0,1,0,1, //55
//     1,0,1,0,1,0,1,0,    
// ]


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
        if(Math.floor(checkSpot/8) != Math.floor(pawnCoord/8) && 0 <=checkSpot && checkSpot <= 63){
            if(board[pawnCoord + o] === 0 && !justKilled){
                res.push([o]);
                foundKill = true;
            }
            else if(Math.abs(board[pawnCoord + o]) === 3 - Math.abs(p) && board[pawnCoord + o * 2] === 0){ //kill scenario
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

//console.log(checkBoard(gameboard,46))

module.exports = {
    checkBoard
}