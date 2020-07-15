import React from 'react';
//import color from './color';
import '../stylesheets/Square.scss';

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
    if (props.src === "null") return <button className={"square-"+props.shade} onClick={props.handleClick} />;
    return (
        <button className={"square-"+props.shade} onClick={props.handleClick}>
            <img 
                src={props.src}
                alt="chess piece"
            />
        </button>
    );
}

export default Square;
