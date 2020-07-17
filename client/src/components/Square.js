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
    // figure out the style of this component based on the props
    let style = {};
    if (props.selected) style.border = "2px solid #ff0000";
    else if (props.highlighted) style.border = "2px solid #0000ff";

    // render the square 
    if (props.src === "null") {
        return (<button 
                    className={"square-"+props.shade} 
                    onMouseDown={props.handleMouseDown} 
                    style={style}
                />);
    } else {
        return (<button 
                    className={"square-"+props.shade} 
                    onMouseDown={props.handleMouseDown}
                    style={style}>
                        <img 
                            src={props.src}
                            alt="chess piece"
                        />
                </button>);
    }
}

export default Square;
