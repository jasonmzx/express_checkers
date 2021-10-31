// 2 = Red Pawn (4 Red KingPawn)
// 1 = Black Pawn (3 Black KingPawn)

//2D matrix for gameboard (slower array, but visually much easier for debug)

const gameboard = [
    0,2,0,2,0,2,0,2, //7
    2,0,2,0,2,0,0,0, //15
    0,0,0,0,0,1,0,0,
    0,0,0,0,0,0,2,0,
    0,2,0,2,0,0,0,0,
    0,0,0,0,0,0,2,0, 
    0,1,0,2,0,1,0,1, //55
    1,0,1,0,1,0,1,0,    
]

const reversedboard = [
                    0,1,0,1,0,1,0,1,
                    1,0,1,0,1,0,1,0,
                    0,1,0,1,0,1,0,1,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    2,0,2,0,2,0,2,0,
                    0,2,0,2,0,2,0,2,
                    2,0,2,0,2,0,2,0
                    ]


const actionCheck = (board, pawnCoord, selectedPawn, king, depth, revFlag, moveObj) => {

    console.log('DEPTH = '+depth)

    //Defining Objects
    const pawnMovement = {
        pawn: revFlag ? [7,9] : [-7,-9], 
        king: [7,9,-7,-9]
    }

    //if object exists pass in self, else, create data structure
    let moveObject = depth ? moveObj : { moves: [], kills: {} }


    let validSpot = [];

    //Assigning valid spots to pawnCoord
    const validateSpots = (checkArray) => {
        for(let move of checkArray){
            let checkSpot = pawnCoord+move
            if(( Math.floor(checkSpot/8) != Math.floor(pawnCoord/8) && (checkSpot >= 0 && checkSpot <= 63)  )){
                validSpot.push(checkSpot);
            } 
        }    
    } //end of validateSpots

    //Selecting Pawn Movement type, (Either Pawn or King)
    if(!king){ validateSpots(pawnMovement.pawn);} else { validateSpots(pawnMovement.king);}

    console.log('ValidSpots: '+validSpot)

    //Add 1 to depth

    for(let spot of validSpot){
        console.log("SPOT: "+spot)
        console.log(`${board[spot]} && ${selectedPawn}`)
        switch(Math.abs(board[spot])){
            case selectedPawn:{ //If spot has own pawn (pawn or king)
                console.log('Same pawn is ahead of it')
                continue;
            } 
            case 0: { //If spot is empty
                console.log('Valid move!')
                if(!depth){
                    moveObject.moves.push(spot);
                }
                continue;
            }   
            default: { //opponent pawn is in spot:
                console.log('Enemy Pawn! at '+spot+' Original pawn at: '+pawnCoord);
                if(pawnCoord-spot > 8 && board[spot+pawnMovement.pawn[1]] != null && board[spot+pawnMovement.pawn[1]] == 0){ //left side
                    
                    if (!moveObject.kills[depth]){ moveObject.kills[depth] = []; } //Check if movObj.kills key exists

                    moveObject.kills[depth].push({'init': pawnCoord,'final': spot+pawnMovement.pawn[1],'kill':spot})

                    actionCheck(board,spot+pawnMovement.pawn[1],selectedPawn,king,depth+1,revFlag,moveObject);
                }
                else if(pawnCoord-spot < 8 && board[spot+pawnMovement.pawn[0]] != null && board[spot+pawnMovement.pawn[0]] == 0){

                    if (!moveObject.kills[depth]){ moveObject.kills[depth] = []; } //Check if movObj.kills key exists

                    moveObject.kills[depth].push({'init': pawnCoord,'final': spot+pawnMovement.pawn[0],'kill':spot})

                    actionCheck(board,spot+pawnMovement.pawn[0],selectedPawn,king,depth+1,revFlag,moveObject);
                }

            } 
        }
    }

    console.log('gets here/')
    return moveObject


}

const checkBoard = (board, reversed, pawnCoord) => {
    if([1,-1].includes(board[pawnCoord])){ //Black pawn
        return actionCheck(board,pawnCoord,board[pawnCoord],board[pawnCoord] < 0,0,reversed)
    }else if ( [2,-2].includes(board[pawnCoord])){ //Red pawn
        return actionCheck(board,pawnCoord,board[pawnCoord],board[pawnCoord] < 0,0,reversed)
    }

}

const checkResult = checkBoard(gameboard, false, 55)

console.log("CheckResult:")
console.log(checkResult);
console.log("\nKills List")
console.log(checkResult.kills)

