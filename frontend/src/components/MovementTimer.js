import React from 'react'

const MovementTimer = (props) => {
    const time = parseInt(props.time);
    console.log('MovementTimer Component');
    console.log(time);

    const [counter, setCounter] = React.useState(time);
    
    React.useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
      }, [counter]);
    

    return (
        <div>
            {counter}
        </div>
    )
}

export default MovementTimer
