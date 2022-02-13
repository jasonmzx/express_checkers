import React, {useRef, clearState,useState,useCallback} from 'react'


const MovementTimer = (props) => {
    console.log('Re initizalized')
    const time = parseInt(props.time);
    const last_time = parseInt(props.last_time);

    //clearState()
    console.log( 

        "Estimated Time:\n"+
        ((last_time+time*1000) - Date.now() )/1000
        
    );

    let [counter, setCounter] = React.useState(Math.round( ((last_time+time*1000) - Date.now() )/1000 ) );
    // const reinit = () => {
    //     setCounter(time)
    // }

    console.log(counter);
    console.log(last_time);

    React.useEffect(() => {

        counter > 0 && setTimeout(() => setCounter(
            counter - 1
        ), 1000); //Set this too Due time - last time / 1000 (for secs)

        
        if(counter === 0){
            const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    
            const socket = new WebSocket(socketProtocol+(window.location.href).split(':')[1]+':5000');
    
            socket.onopen = async () => {
                await socket.send(JSON.stringify({
                    query_type : 't0',
                    room_id: (window.location.pathname).slice(6)
                }));
                socket.close();
                
    
            }
            setCounter(Math.round( ((last_time+time*1000) - Date.now() )/1000 ))
        }    



      }, [counter]);
    
    if(counter === 0){
        const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

        const socket = new WebSocket(socketProtocol+(window.location.href).split(':')[1]+':5000');

        socket.onopen = async () => {
            await socket.send(JSON.stringify({
                query_type : 't0',
                room_id: (window.location.pathname).slice(6)
            }));
            socket.close();
            

        }
    }


    return (
        <div>
            {counter}
        </div>
    )
}

export default MovementTimer
