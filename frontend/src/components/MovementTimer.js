import React from 'react'

const MovementTimer = (props) => {
    console.log('Re initizalized')
    const time = parseInt(props.time);
    const last_time = parseInt(props.last_time);

    let [counter, setCounter] = React.useState(time);

    console.log(counter);
    console.log(last_time);

    React.useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
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
