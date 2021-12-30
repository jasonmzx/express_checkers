
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


    //Check for a new king

    //Black
        for(let b = 0 ; 8 > b; b++){
            if(board[b] === 1){board[b] = -1;}
        }

    //Red
        for(let b = 56; 64 > b; b++){
            if(board[b] === 2){board[b] = -2;}
        }



        return board;



    // switch(board[oldPawn]) {
    //     case 1:
    //         for(let j = 0; j < positionPossib[pathFilter[0]].length; j++ ){
    //             const vJ = validation[pathFilter[0]][j];
    //             const pJ = positionPossib[pathFilter[0]][j];

    //             console.log(vJ +' , '+pJ);
                
    //             if(Math.abs(vJ) < 14 ){ //Move scenario (no kill)
    //                 board[oldPawn] = 0;
    //                 board[pJ] = 1;
    //                 return board;
    //             } else {

    //                 board[pJ + -1 * vJ/2] = 0;

    //                 if(newPawn === pJ){
    //                     board[oldPawn] = 0;
    //                     board[pJ] = 1;
    //                     return board;
    //                 }

    //             }   //end of else 

    //         }    //end of loop


    //         return;
    //     case 2:
    //         //code
    //         return;
    //     default: //(If king)
    //         //code
    //         return;
    // }


    



}

module.exports = {
    Converter
}