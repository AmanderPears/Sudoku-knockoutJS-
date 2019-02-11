ko.options.deferUpdates = true;

//variables

// let puzzle = "1........753..86...6..23.5...4..528.8..3.....5.67...3.......1.....1.6...4..8.....";
// let puzzle = ".9.64.......9....5..4......2...7......5.39....49..2.6887......9...3..2.6....9.7..";
// let puzzle = "1..3...8.9.5.......6....7.....9..346......8.......59....4....7.516.3....8.3...69.";
// let puzzle = ".................2.49......5....64....42916....784...16.....98......8.5.9.5..2..6";
// let puzzle = "9.1.6.5.....3.2...34......8.3.4.........3..6.42...8.....58.91...........6...15...";
let puzzle = "3......69..8.94......37.1...39...7.16.1.....4.4....8..5.7.3....1..7.........8....";

//row index
let row = [1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 6, 6, 6, 6,
    7, 7, 7, 7, 7, 7, 7, 7, 7,
    8, 8, 8, 8, 8, 8, 8, 8, 8,
    9, 9, 9, 9, 9, 9, 9, 9, 9];

// col index
let col = [1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    1, 2, 3, 4, 5, 6, 7, 8, 9];

//grd index
let grd = [1, 1, 1, 2, 2, 2, 3, 3, 3,
    1, 1, 1, 2, 2, 2, 3, 3, 3,
    1, 1, 1, 2, 2, 2, 3, 3, 3,
    4, 4, 4, 5, 5, 5, 6, 6, 6,
    4, 4, 4, 5, 5, 5, 6, 6, 6,
    4, 4, 4, 5, 5, 5, 6, 6, 6,
    7, 7, 7, 8, 8, 8, 9, 9, 9,
    7, 7, 7, 8, 8, 8, 9, 9, 9,
    7, 7, 7, 8, 8, 8, 9, 9, 9];

//set cell position using variable 'row', 'col', and 'grd'
function neighbours(index) {
    let list = [];

    //set neigbours
    row.forEach((v, i) => {
        if (v == row[index] && i != index) {
            list.push(i);
        }
    });
    col.forEach((v, i) => {
        if (v == col[index] && i != index) {
            list.push(i);
        }
    });
    grd.forEach((v, i) => {
        if (v == grd[index] && i != index) {
            list.push(i);
        }
    });

    return list;
}

//individual cell
class Cell {
    constructor(value, given, type) {
        this.value = ko.observable(value).extend({ rateLimit: 50 });
        this.given = ko.observable(given).extend({ rateLimit: 50 });
        this.type = ko.observable(type).extend({ rateLimit: 50 });
    }
}

class SudokuCell extends Cell {
    constructor(value, given, type, index) {
        super(value, given, type);
        this.index = index;
        this.row = row[index];
        this.col = col[index];
        this.grd = grd[index];
        this.neighbours = neighbours(index);
        this.indicator = ko.observable('btn-default').extend({ rateLimit: 50 });

        this.value.subscribe(() => {
            checkCell(this);
        });
    }
}

//group of cells
//let Cells = [];
let Cells = ko.observableArray().extend({ rateLimit: 50 });
for (let i = 0; i < puzzle.length; i++) {
    if (puzzle.charAt(i) !== '.') {
        //        Cells[i] = new SudokuCell(parseInt(puzzle.charAt(i)), true, 'button', i);
        Cells.push(new SudokuCell(parseInt(puzzle.charAt(i)), true, 'button', i));
    } else {
        //Cells[i] = new SudokuCell(0, false, 'number', i);
        Cells.push(new SudokuCell(0, false, 'number', i));
    }
}

ko.applyBindings(Cells);


//check a cell using 'Cells'
function checkCell(cell) {
    if (cell.value() >= 1 && cell.value() <= 9) {
        if (cell.neighbours.some(index => {
            if (Cells()[index].value() != 0) {
                return Cells()[index].value() == cell.value();
            }
        })) {
            cell.indicator('btn-danger');
        } else {
            cell.indicator('btn-success');
        }
    } else {
        cell.indicator('btn-default');
    }
}

//reset() 
function reset() {
    Cells().forEach(c => {
        if (!c.given()) {
            c.value(0);
        }
    });
}

//solve the puzzle
function solve() {
    reset();

    let cellArray = ko.mapping.toJS(Cells);

    //true or false variable used to advance or backtrack
    let error = false;

    //start at 0, go upto x, if there is an error go back otherwise move forward
    for (let i = 0; i <= 80; i = error ? ((i - 1) >= 0 ? i - 1 : 0) : i + 1) {
        //display current index (current cell being solved)

        //do calculations only if the cell is not a given value
        if (!cellArray[i].given) {

            //do something "while" the condition is true 
            do {
                //increment by 1
                cellArray[i].value++;

                //check row,column,box for value if it is unique
                //if the value is valid break out of the loop
                //if it is no valid, go to the start of the looop

                if (!cellArray[i].neighbours.some(index => {
                    if (cellArray[index].value != 0) {
                        return cellArray[index].value == cellArray[i].value;
                    }
                })) {
                    break;
                }

            } while (cellArray[i].value <= 9);

            //if it was invalid
            if (cellArray[i].value > 9) {
                //set error true
                error = true;
                //reset value
                cellArray[i].value = 0;
            } else {
                error = false;
            }
        }
    }

    for (let i = 0; i < 81; i++) {
        if (!Cells()[i].given()) {
            Cells()[i].value(cellArray[i].value);
        }
    }
}

function newPuzzle() {
    reset();
    // console.log("reset");

    let numList = [];

    for (let i = 0; i < 5; i++) {
        let rndNum = Math.floor(Math.random() * 9) + 1;
        for (let j = 0; j < i; j++) {
            if (rndNum == numList[j]) {
                rndNum = Math.floor(Math.random() * 9) + 1;
                j = 0;
            }
        }
        numList.push(rndNum);
    }
    for (let i = 5; i < 81; i++) {
        numList.push(0);
    }

    // console.log("numlist ready");

    Cells().forEach((c, index) => {
        c.value(numList[index]);
        c.type('number');
        c.given(index < 5);
    });

    // console.log("numlist applied to cells");

    //remove below
    let numString = "";
    numList.forEach(i => numString += i);
    console.log(numString);
    //remove above

    solve();


    // console.log("solved");

    for (let i = 0; i < 5; i++) {
        Cells()[i].given(false);
    }

    // console.log("previous givens removed");

    let given = Math.floor(Math.random() * 26) + 22;
    for (let i = 0; i < given; i++) {

        let index;
        do {
            index = Math.floor(Math.random() * 81);
        } while (Cells()[index].given() != false);

        Cells()[index].given(true);
        Cells()[index].type('button');
    }

    // console.log("new givens applied");

    Cells().forEach(c => {
        if (!c.given()) {
            c.value(0);
        }
    });

    // console.log("new puzle complete");
}

$(document).ready(function () {
});
