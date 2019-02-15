ko.options.deferUpdates = true;

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
        this.indicator = ko.observable((this.given() ? 'btn-secondary' : 'btn-light')).extend({ rateLimit: 50 });

        this.value.subscribe(() => {
            checkCell(this);
        });


        this.activateNumpad = function (first, event) {
            numpad.top(event.pageY + 'px');
            numpad.left(event.pageX + 'px');
            numpad.visible(true);
            numpad.currentParent = first.index;
            //console.log(first.index);
        };
    }
}

//group of cells
//let Cells = [];
let Cells = ko.observableArray().extend({ rateLimit: 50 });
for (let i = 0; i < puzzle.length; i++) {
    if (puzzle.charAt(i) !== '.') {
        Cells.push(new SudokuCell(parseInt(puzzle.charAt(i)), true, 'button', i));
    } else {
        Cells.push(new SudokuCell(0, false, 'button', i));
    }
}

ko.applyBindings(Cells, $('#table')[0]);


//check a cell using 'Cells'
function checkCell(cell) {
    if ((cell.value() >= 1 && cell.value() <= 9)) {
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
        cell.indicator('btn-secondary');
    }
}

//reset() 
function reset() {
    let rBTN = $('#resetBtn');
    rBTN.prop('disabled', true);

    Cells().forEach(c => {
        if (!c.given()) {
            c.value(0);
        }
    });

    rBTN.prop('disabled', false);
}

function solve() {
    let sBTN = $('#solveBtn');
    sBTN.prop('disabled', true);

    reset();

    let numList = [];

    Cells().forEach(c => {
        numList.push({
            value: c.value(),
            given: c.given(),
            neighbours: c.neighbours
        });
    });

    let error = false;
    for (let i = 0; i < 81; i = error ? ((i - 1) >= 0 ? i - 1 : 0) : i + 1) {
        if (!numList[i].given) {
            do {
                numList[i].value++;

                if (!numList[i].neighbours.some(index => {
                    if (numList[index].value != 0) {
                        return numList[index].value == numList[i].value;
                    }
                })) {
                    break;
                }

            } while (numList[i].value <= 9);

            //if it was invalid
            if (numList[i].value > 9) {
                //set error true
                error = true;
                //reset value
                numList[i].value = 0;
            } else {
                error = false;
            }
        }
    }

    Cells().forEach((c, index) => {
        c.value(numList[index].value);
    });

    sBTN.prop('disabled', false);
}

function newPuzzle() {

    let npBTN = $('#newBtn');
    npBTN.prop('disabled', true);

    let numList = [];

    Cells().forEach(c => {
        numList.push({
            value: 0,
            given: false,
            neighbours: c.neighbours
        });
    });

    for (let i = 0; i < 5; i++) {
        let rndNum = Math.floor(Math.random() * 9) + 1;
        for (let j = 0; j <= i; j++) {
            if (rndNum === numList[j].value) {
                rndNum = Math.floor(Math.random() * 9) + 1;
                j = -1;
            }
        }
        numList[i].value = rndNum;
        numList[i].given = true;
    }

    let error = false;
    for (let i = 0; i < 81; i = error ? ((i - 1) >= 0 ? i - 1 : 0) : i + 1) {
        if (!numList[i].given) {
            do {
                numList[i].value++;

                if (!numList[i].neighbours.some(index => {
                    if (numList[index].value != 0) {
                        return numList[index].value == numList[i].value;
                    }
                })) {
                    break;
                }

            } while (numList[i].value <= 9);

            //if it was invalid
            if (numList[i].value > 9) {
                //set error true
                error = true;
                //reset value
                numList[i].value = 0;
            } else {
                error = false;
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        numList[i].given = false;
    }

    let given = Math.floor(Math.random() * (26 - 22)) + 22;
    for (let i = 0; i < given; i++) {

        let index;
        do {
            index = Math.floor(Math.random() * 81);
        } while (numList[index].given != false);

        numList[index].given = true;
    }

    numList.forEach((nl, index) => {
        if (nl.given) {
            Cells()[index].value(nl.value);
            Cells()[index].given(nl.given);
            Cells()[index].type('button');
        } else {
            Cells()[index].value(0);
            Cells()[index].given(false);
            Cells()[index].type('number');
        }
    });

    npBTN.prop('disabled', false);
}

var numpad = {
    visible: ko.observable(false),
    position: 'fixed',
    left: ko.observable('0px'),
    top: ko.observable('0px'),
    currentParent: null,
    numkeyClick: function (event) {
        //console.log(this.currentParent);
        Cells()[this.currentParent].value(parseInt(event));
        //console.log(event);

        this.visible(false);
        this.top('-100px');
        this.left('-100px');
    }
}
ko.applyBindings(numpad, $('#numpad')[0]);

$(document).ready(function () {

});
