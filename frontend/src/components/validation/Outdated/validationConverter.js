
let Converter = async (board, validation,oldPawn,newPawn) => {

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

    switch(board[oldPawn]) {
        case 1:
            console.log('got hr?')
            for(let j = 0; j < positionPossib[pathFilter[0]].length; j++ ){
                const vJ = validation[pathFilter[0]][j];
                const pJ = positionPossib[pathFilter[0]][j];
                
                if(Math.abs(vJ) < 14 ){ //Move scenario (no kill)
                    board[oldPawn] = 0;
                    board[pJ] = 1;
                    return board;

                } else {

                }    

                console.log(vJ +' , '+pJ);

            }    


            return;
        case 2:
            //code
            return;
        default: //(If king)
            //code
            return;
    }


    



}

module.exports = {
    Converter
}