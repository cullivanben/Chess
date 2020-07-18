import React from 'react';
import ChessSide from './ChessSide';


// this class will contain most of the components on the screen
class Screen extends React.Component {
    render() {
        console.log("screen rendered");
        return (<div>
                    <ChessSide />
                </div>);
    }
}

export default Screen;