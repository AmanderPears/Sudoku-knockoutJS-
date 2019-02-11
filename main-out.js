ko.options.deferUpdates = true;

let puzzle =
    //"1..3...8.9.5.......6....7.....9..346......8.......59....4....7.516.3....8.3...69.";
    //".................2.49......5....64....42916....784...16.....98......8.5.9.5..2..6";
    "9.1.6.5.....3.2...34......8.3.4.........3..6.42...8.....58.91...........6...15...";

//individual cell
class Cell {
    constructor(value, given, type) {
        this.value = ko.observable(value).extend({ rateLimit: 50 });
        // this.value.subscribe((newVal) => {
        //     console.log("new val: " + newVal);
        // });
        this.given = ko.observable(given).extend({ rateLimit: 50 });
        this.type = ko.observable(type).extend({ rateLimit: 50 });
    }
}

class SudokuCell extends Cell {
    constructor(value, given, type, index) {
        super(value, given, type);
        this.index = index;
        this.row;
        this.col;
        this.grd;
        this.setPos(index);
        this.value.subscribe((val) => {
            if (val > 0 && val < 10) {
                check();
            } else {
                this.value(0);
            }
        });
        this.indicator = ko.observable('btn-default').extend({ rateLimit: 50 });
    }

    setPos(index) {
        //set row
        let row = [1, 1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2, 2, 2,
            3, 3, 3, 3, 3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5, 5, 5, 5, 5,
            6, 6, 6, 6, 6, 6, 6, 6, 6,
            7, 7, 7, 7, 7, 7, 7, 7, 7,
            8, 8, 8, 8, 8, 8, 8, 8, 8,
            9, 9, 9, 9, 9, 9, 9, 9, 9];
        this.row = row[index];

        //set col
        let col = [1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9,
            1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.col = col[index];

        //set grd
        let grd = [1, 1, 1, 2, 2, 2, 3, 3, 3,
            1, 1, 1, 2, 2, 2, 3, 3, 3,
            1, 1, 1, 2, 2, 2, 3, 3, 3,
            4, 4, 4, 5, 5, 5, 6, 6, 6,
            4, 4, 4, 5, 5, 5, 6, 6, 6,
            4, 4, 4, 5, 5, 5, 6, 6, 6,
            7, 7, 7, 8, 8, 8, 9, 9, 9,
            7, 7, 7, 8, 8, 8, 9, 9, 9,
            7, 7, 7, 8, 8, 8, 9, 9, 9];
        this.grd = grd[index];
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



function check() {

    Cells().forEach(c => {
        if (!c.given() && c.value() != 0) {
            if (Cells().some(d => {
                if (c.row == d.row || c.col == d.col || c.grd == d.grd) {
                    if (c.index != d.index) {
                        return c.value() == d.value();
                    }
                }
            })) {
                c.indicator('btn-danger');
            } else {
                c.indicator('btn-success');
            }
        }
    });
}


function solve() {

    //true or false variable used to advance or backtrack
    let error = true;

    //start at 0, go upto x, if there is an error go back otherwise move forward
    for (let i = 0, count = 0; i <= 68; i = error ? ((i - 1) >= 0 ? i - 1 : 0) : i + 1, count++) {
        //display current index (current cell being solved)

        //console.log(count);
        //do calculations only if the cell is not a given value
        if (!Cells()[i].given()) {

            let value = Cells()[i].value();

            //do something "while" the condition is true 
            do {
                //increment by 1
                //Cells[i].value(Cells[i].value() + 1);
                value++;

                //check row,column,box for value if it is unique
                //if the value is valid break out of the loop
                //if it is no valid, go to the start of the looop
                // if (!Cells.some(c => {
                //     if ((c.index != Cells[i].index) && (c.row == Cells[i].row || c.col == Cells[i].col || c.grd == Cells[i].grd)) {
                //         return c.value() == Cells[i].value();
                //     }
                // })) {
                //     break;
                // }
                if (!Cells().some(c => {
                    if ((c.index != Cells()[i].index) && (c.value() != 0)) {
                        if (c.row == Cells()[i].row || c.col == Cells()[i].col || c.grd == Cells()[i].grd) {
                            return c.value() == value;
                        }
                    }
                })) {
                    break;
                }
                //keep doing while the value of the current cell is less or equal to 9
                //if none of the values are valid and the loop has reached its end, the value should be 10 which is invalid
                //            } while (Cells[i].value() <= 9);
            } while (value <= 9);

            //if it was invalid
            // if (Cells[i].value() > 9) {
            if (value > 9) {
                //set error true
                error = true;
                //reset value
                Cells()[i].value(0);
            } else {
                //otherwise  proceed forward
                Cells()[i].value(value);
                error = false;
            }
        }
    }

    check();
    console.log("done");
}
function solve2() {
    let cellArray = ko.mapping.toJS(Cells);

    //true or false variable used to advance or backtrack
    let error = true;

    //start at 0, go upto x, if there is an error go back otherwise move forward
    for (let i = 0, count = 0; i <= 80; i = error ? ((i - 1) >= 0 ? i - 1 : 0) : i + 1, count++) {
        //display current index (current cell being solved)

        //console.log(count);
        //do calculations only if the cell is not a given value
        if (!cellArray[i].given) {

            let value = cellArray[i].value;

            //do something "while" the condition is true 
            do {
                //increment by 1
                //Cells[i].value(Cells[i].value() + 1);
                value++;

                //check row,column,box for value if it is unique
                //if the value is valid break out of the loop
                //if it is no valid, go to the start of the looop
                // if (!Cells.some(c => {
                //     if ((c.index != Cells[i].index) && (c.row == Cells[i].row || c.col == Cells[i].col || c.grd == Cells[i].grd)) {
                //         return c.value() == Cells[i].value();
                //     }
                // })) {
                //     break;
                // }
                if (!cellArray.some(c => {
                    if (c.row == cellArray[i].row || c.col == cellArray[i].col || c.grd == cellArray[i].grd) {
                        if ((c.index != cellArray[i].index) || (c.value != 0)) {
                            return c.value == value;
                        }
                    }
                })) {
                    break;
                }
                //keep doing while the value of the current cell is less or equal to 9
                //if none of the values are valid and the loop has reached its end, the value should be 10 which is invalid
                //            } while (Cells[i].value() <= 9);
            } while (value <= 9);

            //if it was invalid
            // if (Cells[i].value() > 9) {
            if (value > 9) {
                //set error true
                error = true;
                //reset value
                cellArray[i].value = 0;
            } else {
                //otherwise  proceed forward
                cellArray[i].value = value;
                error = false;
            }
        }
    }

    for (let i = 0; i < 81; i++) {
        if (!Cells()[i].given()) {
            Cells()[i].value(cellArray[i].value);
        }
    }
    check();
    console.log("Aasd");
}

$(document).ready(function () {
    // let a = performance.now();
    // solve2();
    // let b = performance.now();
    // console.log("Time taken: " + (b - a) / 1000 + "s");
});
