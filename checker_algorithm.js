// 2 = Red Pawn (4 Red KingPawn)
// 1 = Black Pawn (3 Black KingPawn)

//2D matrix for gameboard (slower array, but visually much easier for debug)

const gameboard = [
    0,2,0,2,0,2,0,2,
    2,0,2,0,2,0,2,0,
    0,0,0,2,0,0,0,2,
    2,0,0,0,2,0,2,0,
    0,2,0,0,0,0,0,0,
    0,0,1,0,0,0,2,0,
    0,1,0,1,0,1,0,1, //55
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


const actionCheck = (board, pawnCoord, selectedPawn, king, depth, moveObj) => {

    //Return Object (moveObject), if object exists pass in self, else, create data structure
    let moveObject

    if(!depth){
        moveObject = {
            moves: [],
            kills: {}
        }
    } else {moveObject = moveObj}

    if (!moveObject.kills[depth]){ moveObject.kills[depth] = []; }

    //Pawn movement types:
    const pawnMovement = {
        pawn: [7,9], 
        king: [7,9,-7,-9]
    }

    let validSpot = [];

    //Assigning valid spots to pawnCoord
    const validateSpots = (checkArray) => {
        for(let move of checkArray){
            let checkSpot = pawnCoord-move
            if(!( Math.floor(checkSpot/8) == Math.floor(pawnCoord/8) || !(checkSpot >= 0 && checkSpot <= 63)  )){
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
        switch(board[spot]){
            case selectedPawn: case selectedPawn+2:{ //If spot has own pawn (pawn or king)
                console.log('Same pawn is ahead of it')
                continue;
            } 
            case 0: { //If spot is empty
                console.log('Valid move!')
                if(!depth){
                    moveObject.moves.push(spot);
                }
                return moveObject
                break;
            }   
            default: { //opponent pawn is in spot:
                console.log('Enemy Pawn! at '+spot+' Original pawn at: '+pawnCoord)
                if(pawnCoord-spot > 8 && board[spot-9] == 0){ //left side

                    moveObject.kills[depth].push({'init': pawnCoord,'final': spot-9,'kill':spot})

                    actionCheck(board,spot-9,selectedPawn,king,depth+1,moveObject);
                }
                else if(pawnCoord-spot < 8 && board[spot-7] == 0){

                    moveObject.kills[depth].push({'init': pawnCoord,'final': spot-7,'kill':spot})

                    actionCheck(board,spot-7,selectedPawn,king,depth+1,moveObject);
                }


            } 
        }
    }

    return moveObject


}

const checkBoard = (board, reversed, pawnCoord) => {
    if([1,-1].includes(board[pawnCoord])){ //Black pawn
        switch(board[pawnCoord]){
            case 1:{
                return actionCheck(board,pawnCoord,board[pawnCoord],false,0)
                break;
            }
            case -1:{
                return actionCheck(board,pawnCoord,board[pawnCoord],true,0)
                break;
            }
        }
    }else if ( [2,-2].includes(selectedPawn)){ //Red pawn

    }

}

const checkResult = checkBoard(gameboard, false, 42)

console.log("CheckResult:")
console.log(checkResult);
console.log("\nKills List")
console.log(checkResult.kills)

