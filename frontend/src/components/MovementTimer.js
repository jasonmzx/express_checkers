import React from 'react'

const MovementTimer = () => {
    const [counter, setCounter] = React.useState(60);
    
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
