import React from 'react';
import color from './color';

// class Square extends React.Component {
//     constructor(props) {
//         super(props);
//         this.spot = this.props.spot;
//     }

//     render() {
//         return (
//             <Button 
//                 style={this.props.style}
//                 className={"square-"+this.props.shade}
//                 onClick={this.props.onClick}
//             />
//         );
//     }
// }

const Square = (props) => {
    return (
        <Button 
            style={props.style}
            className={"square-"+props.shade}
            onClick={props.onClick}
        />
    );
}

export default Square;
