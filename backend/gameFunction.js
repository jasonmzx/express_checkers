//In this file, all the main game functionality is generated or validated


//Checkboard returns 2D array  [ [] , [] ]
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

//validation Converter returns a 1D array (new gameBoard)
let Converter = (board, validation,oldPawn,newPawn) => {

    const pC = board[oldPawn];

    console.log(validation);

    const reducerSum = (pV, cV) => pV + cV;

    //Returns the possible positions of selected Pawn (for every possibility)
    let positionPossib = validation.map((e) => {
        return e.map((j,index) => { return oldPawn + e.slice(0, index+1).reduce(reducerSum,0); } );
    });

    console.log(positionPossib);

    let pathFilter = [] //All paths that include newPawn (index of path(s))

    for(const [i,v] of positionPossib.entries() ){
        if(v.includes(newPawn)){pathFilter.push(i)}
    }
    
    console.log(pathFilter);

    for(let j = 0; j < positionPossib[pathFilter[0]].length; j++ ){
        const vJ = validation[pathFilter[0]][j];
        const pJ = positionPossib[pathFilter[0]][j];

        console.log(vJ +' , '+pJ);
            
        if(Math.abs(vJ) < 14 ){ //Move scenario (no kill)
                board[oldPawn] = 0;
                board[pJ] = pC;
                //return board;
        } else {

                board[pJ + 
                    (positionPossib[pathFilter[0]][0] > 0 ? -1 : 1)
                    * vJ/2] = 0;

                if(newPawn === pJ) {
                    board[oldPawn] = 0;
                    board[pJ] = pC;
                    //return board;
                }

        }   //end of else 

    }    //end of loop

    //Black
        for(let b = 0 ; 8 > b; b++){
            if(board[b] === 1){board[b] = -1;}
        }

    //Red
        for(let b = 56; 64 > b; b++){
            if(board[b] === 2){board[b] = -2;}
        }
        return board;
}

//create game room ID Generator (return's: string)
const IdGenerator = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ret = ''
    for (let i = 0; i < 5; i++) {
        ret += chars[Math.round(Math.random()*61)];
    }
    return ret
}


module.exports = {
    checkBoard,
    Converter,
    IdGenerator,
}
