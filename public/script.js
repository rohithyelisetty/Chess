var moveInterval = 30;
var seconds = moveInterval;
var countdown = setInterval(timer, 1000);
var button1 = null;
var button2 = null;
var button2HTML = null;
var boardColor = null;
var roomId;
var whiteCheck = false;
var blackCheck = false;
var rook1White = false;
var rook2White = false;
var rook1Black = false;
var rook2Black = false;
var kingWhite = false;
var kingBlack = false;
const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];
const blackPieces = /[♜♞♝♛♚♟]/g;
const whitePieces = /[♖♘♗♕♔♙]/g;
const whitePawn = "♙";
const whiteRook = "♖";
const whiteKnight = "♘";
const whiteBishop = "♗";
const whiteQueen = "♕";
const whiteKing = "♔";
const blackPawn = "♟︎";
const blackRook = "♜";
const blackKnight = "♞";
const blackBishop = "♝";
const blackQueen = "♛";
const blackKing = "♚";
const white = "white";
const black = "black";

var socket = io();
socket.on('move', function(move) {
    console.log(move);
    importMove(move);
});

socket.on('roomUsers', function(roomUsers) {
    if (roomUsers === 1) {
        waiting();
    } else {
        usersChange();
    }
});

socket.on("roomId", function(room) {
    roomId = room;
    document.getElementById("roomCode").innerHTML = "Room Code: " + roomId;
});

socket.on("tooManyUsers", function() {
    alert("Too many Users In the Room. Please find another room");
});

socket.on("randomJoin", function(room) {
    roomId = room;
    document.getElementById("roomCode").innerHTML = "Room Code: " + roomId;
    socket.emit("join", roomId);
});

socket.on("noEmpty", function() {
    alert("No empty rooms currently");
});

socket.on('color', function(color) {
    boardColor = color;
});

function enableJoin() {
    if (document.getElementById("joinRoom").value.length === 6) {
        document.getElementById("join").disabled = false;
    } else {
        document.getElementById("join").disabled = true;
    }
}

function generateId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function addRoomId() {
    roomId = generateId(6);
    document.getElementById("roomCode").innerHTML += roomId;
    socket.emit("join", roomId);
}

function joinRoom() {
    roomId = document.getElementById("joinRoom").value;
    socket.emit("join", roomId);
}

function randomRoom() {
    socket.emit("random");
}

function movePieces(id) {
    whiteCheck = false;
    blackCheck = false;
    resetBoardColor();

    if (button1 === null) {
        button1 = document.getElementById(id);
        switch (button1.innerHTML) {
            case whitePawn:
                pawn(id, white, true);
                break;
            case blackPawn:
                pawn(id, black, true);
                break;
            case whiteRook:
                rook(id, white, true);
                break;
            case blackRook:
                rook(id, black, true);
                break;
            case whiteBishop:
                bishop(id, white, true);
                break;
            case blackBishop:
                bishop(id, black, true);
                break;
            case whiteQueen:
                queen(id, white, true);
                break;
            case blackQueen:
                queen(id, black, true);
                break;
            case whiteKnight:
                knight(id, white, true);
                break;
            case blackKnight:
                knight(id, black, true);
                break;
            case whiteKing:
                king(id, white, true);
                break;
            case blackKing:
                king(id, black, true);
                break;
            default:
                button1 = null;
                break;
        }
    } else {
        button2 = document.getElementById(id);
        button2HTML = button2.innerHTML;
        rookMoved();
        kingMoved();
        checkMate();
        pieceKill();
        button2.innerHTML = button1.innerHTML;
        castleChosen("right", white);
        castleChosen("left", white);
        castleChosen("right", black);
        castleChosen("left", black);
        if (button1.innerHTML === whitePawn) {
            pawnToPiece(id, white);
        } else if (button1.innerHTML === blackPawn) {
            pawnToPiece(id, black);
        }

        if (button1 === button2) {
            resetBoardColor();
            turn1();
            button1 = null;
            button2 = null;
            return;
        }

        button1.innerHTML = "";
        check(true);
        if (illegalMoveCheck(pieceColor(button2.id))) {
            return;
        }
        movesHistory(button1, button2);
        exportMove();
        switchHTML();

        button1 = null;
        button2 = null;
    }
}

function pawn(id, color, move) {
    var letter = id.charAt(0);
    var number = id.charAt(1);
    var idNumber = numbers.indexOf(number);

    var doubleMoveNumber;
    var moveIncrement;
    if (color === white) {
        doubleMoveNumber = 2;
        moveIncrement = 1;
    }
    if (color === black) {
        doubleMoveNumber = 7;
        moveIncrement = -1;
    }

    var singleMove = letter + numbers[idNumber + moveIncrement];
    var doubleMove = letter + numbers[idNumber + 2 * moveIncrement];
    if (idNumber + 1 === doubleMoveNumber) {
        if (document.getElementById(singleMove).innerHTML === "") {
            possibleMove(singleMove, move);
        }
        if (document.getElementById(singleMove).innerHTML === "" &&
            document.getElementById(doubleMove).innerHTML === "") {
            possibleMove(doubleMove, move);
        }
    } else {
        if (document.getElementById(singleMove).innerHTML === "") {
            possibleMove(singleMove, move);
        }
    }
    var nextNumber = numbers[idNumber + moveIncrement];
    var nextLetter = letters[letters.indexOf(letter) + 1];
    var backLetter = letters[letters.indexOf(letter) - 1];
    switch (letter) {
        case 'a':
            pawnKill(nextLetter + nextNumber, color, move);
            break;
        case 'h':
            pawnKill(backLetter + nextNumber, color, move);
            break;
        default:
            pawnKill(nextLetter + nextNumber, color, move);
            pawnKill(backLetter + nextNumber, color, move);
            break;
    }
    if (move === true) {
        enableMoves(false);
    }

}

function pawnKill(killButton, color, move) {
    if (color === white && document.getElementById(killButton).innerHTML.match(blackPieces)) {
        possibleMove(killButton, move);
    } else if (color === black && document.getElementById(killButton).innerHTML.match(whitePieces)) {
        possibleMove(killButton, move);
    }
}

function pawnToPiece(id, color) {
    var number = id.charAt(1);
    var ptpNumber;
    if (color === white) {
        ptpNumber = '8';
    } else if (color === black) {
        ptpNumber = '1';
    }

    if (number === ptpNumber) {
        var pawnToPiece = window.prompt('What do you want the pawn to become? Queen, Rook, Bishop, Knight');
        if (color === white) {
            ptpSwitch(pawnToPiece, id, whiteQueen, whiteRook, whiteBishop, whiteKnight, whitePawn);
        }
        if (color === black) {
            ptpSwitch(pawnToPiece, id, blackQueen, blackRook, blackBishop, blackKnight, blackPawn);
        }
    }
}

function ptpSwitch(pawnToPiece, id, queen, rook, bishop, knight, pawn) {
    switch (pawnToPiece) {
        case "Queen":
            document.getElementById(id).innerHTML = queen;
            break;
        case "Rook":
            document.getElementById(id).innerHTML = rook;
            break;
        case "Bishop":
            document.getElementById(id).innerHTML = bishop;
            break;
        case "Knight":
            document.getElementById(id).innerHTML = knight;
            break;
        default:
            document.getElementById(id).innerHTML = pawn;
            break;
    }
}

function rook(id, color, move) {
    var letter = id.charAt(0);
    var letterArray = letters.indexOf(letter);
    var number = id.charAt(1);
    var numberArray = numbers.indexOf(number);

    rookFor(letterArray, numberArray + 1, 0, 1, color, move);
    rookFor(letterArray, numberArray - 1, 0, -1, color, move);
    rookFor(letterArray + 1, numberArray, 1, 0, color, move);
    rookFor(letterArray - 1, numberArray, -1, 0, color, move);

    if (move === true) {
        enableMoves(false);
    }
}

function rookSideMove(id, color, move) {
    if (document.getElementById(id).innerHTML !== "") {
        if ((color === white && document.getElementById(id).innerHTML.match(whitePieces)) ||
            (color === black && document.getElementById(id).innerHTML.match(blackPieces))) {
            return -1;
        }
        if ((color === white && document.getElementById(id).innerHTML.match(blackPieces)) ||
            (color === black && document.getElementById(id).innerHTML.match(whitePieces))) {
            possibleMove(id, move);
            return -1;
        }
    } else if (document.getElementById(id).innerHTML === "") {
        possibleMove(id, move);
    }
}

function rookFor(letter, number, letterIncrement, numberIncrement, color, move) {
    var moveReturn = -1;
    for (i = 1; i <= 8; i++) {
        if (number === 8 || number === -1 || letter === 8 || letter === -1) {
            break;
        }
        moveReturn = rookSideMove((letters[letter] + numbers[number]), color, move);

        if (moveReturn === -1) {
            break;
        }
        letter += letterIncrement;
        number += numberIncrement;
    }
}

function rookMoved() {
    rook1White = movedPiece("a1", rook1White);
    rook2White = movedPiece("h1", rook2White);
    rook1Black = movedPiece("a8", rook1Black);
    rook2Black = movedPiece("h8", rook2Black);
}

function bishop(id, color, move) {
    var letter = id.charAt(0);
    var number = id.charAt(1);
    var letterUp = letters.indexOf(letter) + 1;
    var letterDown = letters.indexOf(letter) - 1;
    var numberUp = numbers.indexOf(number) + 1;
    var numberDown = numbers.indexOf(number) - 1;

    bishopFor(letterUp, numberUp, 8, 8, 1, 1, color, move);

    letterDown = letters.indexOf(letter) - 1;
    numberUp = numbers.indexOf(number) + 1;
    bishopFor(letterDown, numberUp, -1, 8, -1, 1, color, move);

    letterDown = letters.indexOf(letter) - 1;
    numberDown = numbers.indexOf(number) - 1;
    bishopFor(letterDown, numberDown, -1, -1, -1, -1, color, move);

    letterUp = letters.indexOf(letter) + 1;
    numberDown = numbers.indexOf(number) - 1;
    bishopFor(letterUp, numberDown, 8, -1, 1, -1, color, move);

    if (move === true) {
        enableMoves(false);
    }

}

function bishopFor(letter, number, maxLetter, maxNumber, letterIncrement, numberIncrement, color, move) {
    var moveReturn = -1;
    for (i = 1; i <= 8; i++) {
        if (letter === maxLetter) {
            break;
        }
        if (number === maxNumber) {
            break;
        }
        moveReturn = bishopMove((letters[letter] + numbers[number]), color, move);

        if (moveReturn === -1) {
            break;
        }
        letter += letterIncrement;
        number += numberIncrement;
    }
}

function bishopMove(id, color, move) {
    if (document.getElementById(id).innerHTML !== "") {
        if ((color === white && document.getElementById(id).innerHTML.match(whitePieces)) ||
            (color === black && document.getElementById(id).innerHTML.match(blackPieces))) {
            return -1;
        } else if ((color === white && document.getElementById(id).innerHTML.match(blackPieces)) ||
            (color === black && document.getElementById(id).innerHTML.match(whitePieces))) {
            possibleMove(id, move);
            return -1;
        }
    } else if (document.getElementById(id).innerHTML === "") {
        possibleMove(id, move);
    }
}

function queen(id, color, move) {
    rook(id, color, move);
    bishop(id, color, move);
}

function knight(id, color, move) {
    var letter = id.charAt(0);
    var number = id.charAt(1);
    var charLetter = letters.indexOf(letter);
    var intNumber = numbers.indexOf(number);

    var id1 = (letters[charLetter + 1] + numbers[intNumber + 2]);
    var id2 = (letters[charLetter - 1] + numbers[intNumber + 2]);
    var id3 = (letters[charLetter + 1] + numbers[intNumber - 2]);
    var id4 = (letters[charLetter - 1] + numbers[intNumber - 2]);
    var id5 = (letters[charLetter + 2] + numbers[intNumber + 1]);
    var id6 = (letters[charLetter - 2] + numbers[intNumber + 1]);
    var id7 = (letters[charLetter + 2] + numbers[intNumber - 1]);
    var id8 = (letters[charLetter - 2] + numbers[intNumber - 1]);

    var knightMoves = new Array(id1, id2, id3, id4, id5, id6, id7, id8);

    knightMoves.forEach(element => knightPieceCheck(element, color, move));
}

function knightPieceCheck(id, color, move) {
    if (document.getElementById(id) === null) {
        return;
    }
    if (document.getElementById(id).innerHTML === "") {
        possibleMove(id, move);
    } else if ((color === white && document.getElementById(id).innerHTML.match(blackPieces)) ||
        (color === black && document.getElementById(id).innerHTML.match(whitePieces))) {
        possibleMove(id, move);
    }
    if (move === true) {
        enableMoves(false);
    }
}

function king(id, color, move) {
    var letter = id.charAt(0);
    var number = id.charAt(1);
    var charLetter = letters.indexOf(letter);
    var intNumber = numbers.indexOf(number);


    var id1 = (letters[charLetter + 1] + numbers[intNumber + 1]);
    var id2 = (letters[charLetter - 1] + numbers[intNumber + 1]);
    var id3 = (letters[charLetter + 1] + numbers[intNumber - 1]);
    var id4 = (letters[charLetter - 1] + numbers[intNumber - 1]);
    var id5 = (letters[charLetter] + numbers[intNumber + 1]);
    var id6 = (letters[charLetter + 1] + numbers[intNumber]);
    var id7 = (letters[charLetter] + numbers[intNumber - 1]);
    var id8 = (letters[charLetter - 1] + numbers[intNumber]);

    var kingMoves = new Array(id1, id2, id3, id4, id5, id6, id7, id8);

    kingMoves.forEach(element => kingPieceCheck(element, color, move));

    castle("right", color);
    castle("left", color);
}

function kingPieceCheck(id, color, move) {
    if (document.getElementById(id) === null) {
        return;
    }
    if (document.getElementById(id).innerHTML === "") {
        possibleMove(id, move);
    } else if ((color === white && document.getElementById(id).innerHTML.match(blackPieces)) ||
        (color === black && document.getElementById(id).innerHTML.match(whitePieces))) {
        possibleMove(id, move);
    }
    if (move === true) {
        enableMoves(false);
    }
}

function kingMoved() {
    kingWhite = movedPiece("e1", kingWhite);
    kingBlack = movedPiece("e8", kingBlack);
}

function castle(side, color) {
    switch (side) {
        case "right":
            switch (color) {
                case white:
                    castleRightMove("f1", "g1", rook1White, kingWhite, true, "e1", whiteCheck);
                    break;
                case black:
                    castleRightMove("f8", "g8", rook1Black, kingWhite, true, "e8", blackCheck);
                    break;
            }
            break;
        case "left":
            switch (color) {
                case white:
                    castleLeftMove("d1", "c1", "b1", rook2White, kingWhite, true, "e1", whiteCheck);
                    break;
                case black:
                    castleLeftMove("d8", "c8", "b8", rook2White, kingWhite, true, "e8", blackCheck);
                    break;
            }
            break;
    }
    enableMoves(false);
}

function castleRightMove(block1, block2, rookMoved, kingMoved, move, king, check) {
    if (document.getElementById(block1).innerHTML === "" && document.getElementById(block2).innerHTML === "" &&
        rookMoved === false && kingMoved === false && button1.id === king && !check) {
        possibleMove(block2, move);
    }
}

function castleLeftMove(block1, block2, block3, rookMoved, kingMoved, move, king) {
    if (document.getElementById(block1).innerHTML === "" &&
        document.getElementById(block2).innerHTML === "" && document.getElementById(block3).innerHTML === "" &&
        rookMoved === false && kingMoved === false && button1.id === (king)) {
        possibleMove(block3, move);
    }
}

function castleChosen(side, color) {
    switch (side) {
        case "right":
            switch (color) {
                case white:
                    castleChosenMove("e1", "g1", "f1", "h1", whiteKing, whiteRook);
                    break;
                case black:
                    castleChosenMove("e8", "g8", "f8", "h8", blackKing, blackRook);
                    break;
            }
            break;
        case "left":
            switch (color) {
                case white:
                    castleChosenMove("e1", "b1", "c1", "a1", whiteKing, whiteRook);
                    break;
                case black:
                    castleChosenMove("e8", "b8", "a8", "h8", blackKing, blackRook);
                    break;
            }
            break;
    }
}

function castleChosenMove(button1ID, button2ID, rookMove, corner, king, rook) {
    if (button1.id === button1ID && button2.id === button2ID) {
        document.getElementById(button2ID).innerHTML = king;
        document.getElementById(rookMove).innerHTML = rook;
        document.getElementById(corner).innerHTML = "";
    }
}

function check(alertCheck) {
    letters.forEach(letter => numbers.forEach(number => {
        switch (document.getElementById(letter + number).innerHTML) {
            case whitePawn:
                pawn((letter + number), white, false);
                break;
            case blackPawn:
                pawn((letter + number), black, false);
                break;
            case whiteRook:
                rook((letter + number), white, false);
                break;
            case blackRook:
                rook((letter + number), black, false);
                break;
            case whiteBishop:
                bishop((letter + number), white, false);
                break;
            case blackBishop:
                bishop((letter + number), black, false);
                break;
            case whiteQueen:
                queen((letter + number), white, false);
                break;
            case blackQueen:
                queen((letter + number), black, false);
                break;
            case whiteKnight:
                knight((letter + number), white, false);
                break;
            case blackKnight:
                knight((letter + number), black, false);
                break;
            case whiteKing:
                knight((letter + number), white, false);
                break;
            case blackKing:
                knight((letter + number), black, false);
                break;
            default:
                break;
        }
        var whiteKingPosition = kingPosition(white);
        var blackKingPosition = kingPosition(black);
        if (document.getElementById(whiteKingPosition).classList.contains("check") && !whiteCheck) {
            if (alertCheck) {
                alert('Check to White');
            }
            whiteCheck = true;
            return;
        }
        if (document.getElementById(blackKingPosition).classList.contains("check") && !blackCheck) {
            if (alertCheck) {
                alert('Check to Black');
            }
            blackCheck = true;
            return;
        }
    }))
}

function illegalMoveCheck(color) {
    if (color === white && whiteCheck === true) {
        check();
        if (whiteCheck === true) {
            alert("Invalid Move! Pick another block to stop the check!");
            button1.innerHTML = button2.innerHTML;
            button2.innerHTML = button2HTML;
            resetBoardColor();
            turn1();
            button1 = null;
            button2 = null;
            return true;
        }
    }
    if (color === black && blackCheck === true) {
        check();
        if (blackCheck === true) {
            alert("Invalid Move! Pick another block to stop the check!");
            button1.innerHTML = button2.innerHTML;
            button2.innerHTML = button2HTML;
            resetBoardColor();
            turn1();
            button1 = null;
            button2 = null;
            return true;
        }
    }
}

function kingPosition(color) {
    var kingPositionId;
    letters.forEach(letter => numbers.forEach(number => {
        if (color === white) {
            if (document.getElementById(letter + number).innerHTML === whiteKing) {
                kingPositionId = letter + number;
            }
        }
        if (color === black) {
            if (document.getElementById(letter + number).innerHTML === blackKing) {
                kingPositionId = letter + number;
            }
        }
    }))
    return kingPositionId;
}

function checkMate() {
    var mate = document.getElementById("checkMate");

    if (button2.innerHTML === whiteKing && button2 !== button1) {
        mate.innerHTML = "Checkmate! Black Wins!";
        seconds = -2;
    }
    if (button2.innerHTML === blackKing && button2 !== button1) {
        mate.innerHTML = "Checkmate! White Wins!";
        seconds = -2;
    }
}

function movedPiece(id, pieceMoved) {
    if (button1.id === id && button2.id !== button1.id) {
        return pieceMoved = true;
    }
}

function possibleMove(id, move) {
    if (move === true) {
        document.getElementById(id).classList.add("possibleMove");
    } else {
        document.getElementById(id).classList.add('check');
    }
}

function enableMoves(bool) {
    letters.forEach(element =>
        numbers.forEach(element1 => {
            if (document.getElementById(element + element1).classList.contains("possibleMove")) {
                document.getElementById(element + element1).disabled = bool;
            } else {
                document.getElementById(element + element1).disabled = !bool;
            }
        }));

    button1.disabled = false;

}

function resetBoardColor() {
    letters.forEach(element =>
        numbers.forEach(element1 => {
            document.getElementById(element + element1).classList.remove("possibleMove");
            document.getElementById(element + element1).classList.remove("check");
            document.getElementById(element + element1).classList.remove("lastMove");
        }));
}

function resetBoard() {
    letters.forEach(element =>
        numbers.forEach(element1 => {
            switch (element + element1) {
                case 'a2':
                case 'b2':
                case 'c2':
                case 'd2':
                case 'e2':
                case 'f2':
                case 'g2':
                case 'h2':
                    document.getElementById(element + element1).innerHTML = whitePawn;
                    break;
                case 'a7':
                case 'b7':
                case 'c7':
                case 'd7':
                case 'e7':
                case 'f7':
                case 'g7':
                case 'h7':
                    document.getElementById(element + element1).innerHTML = blackPawn;
                    break;
                case 'a1':
                case 'h1':
                    document.getElementById(element + element1).innerHTML = whiteRook;
                    break;
                case 'a8':
                case 'h8':
                    document.getElementById(element + element1).innerHTML = blackRook;
                    break;
                case 'b1':
                case 'g1':
                    document.getElementById(element + element1).innerHTML = whiteKnight;
                    break;
                case 'b8':
                case 'g8':
                    document.getElementById(element + element1).innerHTML = blackKnight;
                    break;
                case 'c1':
                case 'f1':
                    document.getElementById(element + element1).innerHTML = whiteBishop;
                    break;
                case 'c8':
                case 'f8':
                    document.getElementById(element + element1).innerHTML = blackBishop;
                    break;
                case 'd1':
                    document.getElementById(element + element1).innerHTML = whiteQueen;
                    break;
                case 'd8':
                    document.getElementById(element + element1).innerHTML = blackQueen;
                    break;
                case 'e1':
                    document.getElementById(element + element1).innerHTML = whiteKing;
                    break;
                case 'e8':
                    document.getElementById(element + element1).innerHTML = blackKing;
                    break;
                default:
                    document.getElementById(element + element1).innerHTML = "";
                    break;
            }
        }));
    document.getElementById('Turn').innerHTML = "White's Turn";
    document.getElementById('HistoryMoves').innerHTML = "";
    document.getElementById('WhiteKill').innerHTML = "";
    document.getElementById('BlackKill').innerHTML = "";
}

function timer() {
    if (seconds === -2) {
        return;
    }
    seconds -= 1;
    document.getElementById("countdown").innerHTML = seconds;
    if (seconds === 0) {
        setTimeout(1000);
        switchHTML();
        return;
    }
}

function switchHTML() {
    var turn = document.getElementById('Turn');

    clearInterval(countdown);
    if (turn.innerHTML === "White's Turn") {
        turn.innerHTML = "Black's Turn";
    } else {
        turn.innerHTML = "White's Turn";
    }
    turn1(true);
    document.getElementById("countdown").innerHTML = seconds;
    countdown = setInterval(timer, 1000);
    resetBoardColor();

    button1 = null;
    button2 = null;
}

function turn1(change) {
    if (change) {
        seconds = moveInterval;
    }
    var turn = document.getElementById('Turn');

    letters.forEach(element => numbers.forEach(element1 => {
        if ((turn.innerHTML === "White's Turn" && boardColor === white &&
                document.getElementById(element + element1).innerHTML.match(whitePieces)) ||
            (turn.innerHTML === "Black's Turn" && boardColor === black &&
                document.getElementById(element + element1).innerHTML.match(blackPieces))) {
            document.getElementById(element + element1).disabled = false;
        } else {
            document.getElementById(element + element1).disabled = true;
        }
    }));
}

function pieceColor(id) {
    if (document.getElementById(id).innerHTML.match(whitePieces)) {
        return white;
    }
    if (document.getElementById(id).innerHTML.match(blackPieces)) {
        return black;
    }
    return "empty";
}

function movesHistory(from, to) {
    var historyMoves = document.getElementById('HistoryMoves');
    var moves = to.innerHTML + ", " + from.id + ", " + to.id;

    historyMoves.innerHTML += moves + '<br>';
}

function pieceKill() {
    var whiteKill = document.getElementById("WhiteKill");
    var blackKill = document.getElementById("BlackKill");

    if (button2.id !== button1.id) {
        if (button2.innerHTML !== "" && button1.innerHTML.match(whitePieces)) {
            blackKill.innerHTML += button2.innerHTML + ", ";
        }
        if (button2.innerHTML !== "" && button1.innerHTML.match(blackPieces)) {
            whiteKill.innerHTML += button2.innerHTML + ", ";
        }
    }
}

function usersChange() {
    document.getElementById('room').style.display = 'none';
    document.getElementById('userWaiting').style.display = 'none';
    document.getElementById('container').style.display = 'block';
    turn1(true);
}

function waiting() {
    document.getElementById('room').style.display = 'none';
    document.getElementById('userWaiting').style.display = 'block';
    document.getElementById('container').style.display = 'none';
    resetBoard();
    resetBoardColor();
    seconds = -2;
    boardColor = white;
}

function exportMove() {
    var move;
    if (button2.innerHTML.match(blackPieces)) {
        move = "b" + button1.id + button2.id;
    } else if (button2.innerHTML.match(whitePieces)) {
        move = "w" + button1.id + button2.id;
    }
    console.log(move);
    socket.emit('move', move, roomId);
    pieceKill();
}

function importMove(move) {
    var fromLocation = move.substring(1, 3);
    var toLocation = move.substring(3);
    var fromButton = document.getElementById(fromLocation);
    var toButton = document.getElementById(toLocation);
    var whiteKill = document.getElementById("WhiteKill");
    var blackKill = document.getElementById("BlackKill");

    if (toButton.innerHTML !== "" && pieceColor(toButton.id) === white) {
        whiteKill.innerHTML += toButton.innerHTML + ", ";
    } else if (toButton.innerHTML !== "" && pieceColor(toButton.id) === black) {
        blackKill.innerHTML += toButton.innerHTML + ", ";
    }
    toButton.innerHTML = fromButton.innerHTML;
    movesHistory(fromButton, toButton);
    check(true);
    fromButton.innerHTML = "";
    switchHTML();
    fromButton.classList.add("lastMove");
    toButton.classList.add("lastMove");
    fromButton = null;
    toButton = null;
}