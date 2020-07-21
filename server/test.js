require('dotenv/config');
console.log(process.env.COOKIE_SECRET);

console.log(parseInt("0") == "0");
console.log(parseInt("color") == "color");

let test = {
    pawn: 4
}
console.log(test['pawn']);

let arr = ['Pawn', 'Queen', 'Rook', 'Rook', 'Knight', 'Knight', 'Pawn', 'Pawn'];

// counts the number of dead pieces of each type and returns an array of them sorted by 
// number of casualties
function arrangeDead(arr) {
    let counts = new Map();
    arr.forEach(piece => {
        if (counts.has(piece)) counts.set(piece, counts.get(piece)+1);
        else counts.set(piece, 1);
    });
    let out = [];
    for (let key of counts.keys()) {
        out.push([key, counts.get(key)]);
        let i = out.length - 1;
        while (i > 0 && out[i-1][1] <= out[i][1]) {
            if (out[i-1][1] === out[i][1] && out[i-1][0] < out[i][0]) break;
            temp = out[i];
            out[i] = out[i-1];
            out[i---1] = temp;
        }
    }
    return out;
}

console.log(arrangeDead(arr));