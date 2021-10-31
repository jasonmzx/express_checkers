const gameboard = [
    0,2,0,2,0,2,0,2, //7
    2,0,2,0,2,0,0,0, //15
    0,0,0,0,0,1,0,0,
    0,0,0,0,2,0,2,0,
    0,2,0,2,0,0,0,0,
    0,0,0,0,0,0,2,0, 
    0,1,0,2,0,1,0,1, //55
    1,0,1,0,1,0,1,0,    
]


const checkBoard = (board, pawnCoord, justKilled) => {
    if(!board[pawnCoord])
        return;
    
    let p = board[pawnCoord];
    let offsets = p & 1 ? [-7, -9] : [7, 9];
    console.log(offsets)

    let res = [];
    let foundKill = false;
    for(let o of offsets){
        let checkSpot = pawnCoord + o;
        if(Math.floor(checkSpot/8) != Math.floor(pawnCoord/8) && 0 <=checkSpot && checkSpot <= 63){
            console.log('r4')
            if(Math.abs(board[pawnCoord + o]) === 3 - Math.abs(p) && board[pawnCoord + o * 2] === 0){ //kill scenario
                console.log('got hre')
                foundKill = true;
                //edit board
                board[pawnCoord] = 0;
                let killed = board[pawnCoord + o];
                board[pawnCoord + o] = 0;
                board[pawnCoord + o * 2] = p;
                let tmp = checkBoard(board, pawnCoord + o * 2, true);
                for(let t of tmp) t.unshift(o * 2);
                res = res.concat(tmp);
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

console.log(checkBoard(gameboard,55));