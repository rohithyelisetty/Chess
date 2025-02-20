var moveInterval = 30;
var seconds = moveInterval;
var countdown = setInterval(timer, 1000);
var turnRotation = 1;
var addLine = false;
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
var checkMoves = [];
var board = [];
const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];
const whitePawn = '<img class="piece" src="whitePawn.png">';
const whiteRook = '<img class="piece" src="whiteRook.png">';
const whiteKnight = '<img class="piece" src="whiteKnight.png">';
const whiteBishop = '<img class="piece" src="whiteBishop.png">';
const whiteQueen = '<img class="piece" src="whiteQueen.png">';
const whiteKing = '<img class="piece" src="whiteKing.png">';
const blackPawn = '<img class="piece" src="blackPawn.png">';
const blackRook = '<img class="piece" src="blackRook.png">';
const blackKnight = '<img class="piece" src="blackKnight.png">';
const blackBishop = '<img class="piece" src="blackBishop.png">';
const blackQueen = '<img class="piece" src="blackQueen.png">';
const blackKing = '<img class="piece" src="blackKing.png">';
const blackPieces = new Array(blackPawn, blackRook, blackKnight, blackBishop, blackQueen, blackKing);
const whitePieces = new Array(whitePawn, whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing);
const white = "white";
const black = "black";

var socket = io();

socket.on('move', function(move) {
    console.log(move);
    importMove(move);
});

socket.on('color', function(color) {
    boardColor = color;
    document.getElementById("Color").innerHTML = "Color: " + boardColor;
});

socket.on('removeCheck', function() {
    document.getElementById("Check").innerHTML = "";
})

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

socket.on("mate", function(html) {
    document.getElementById('Checkmate').innerHTML = html;
});

socket.on("movesHistory", function(html, turnNumber, lineBool) {
    document.getElementById('HistoryMoves').innerHTML = html;
    turnRotation = turnNumber;
    addLine = lineBool;
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
    checkMoves = [];
    board = [];
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
        pieceKill();
        button2.innerHTML = button1.innerHTML;
        castleChosen(button1, button2, "right", white);
        castleChosen(button1, button2, "left", white);
        castleChosen(button1, button2, "right", black);
        castleChosen(button1, button2, "left", black);
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
        check();
        checkMate();
        check();
        movesHistory(button2, true);
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
        illegalMoveCheck(color, button1);
        enableMoves(false);
    }

}

function pawnKill(killButton, color, move) {
    if (color === white && blackPieces.includes(document.getElementById(killButton).innerHTML)) {
        possibleMove(killButton, move);
    } else if (color === black && whitePieces.includes(document.getElementById(killButton).innerHTML)) {
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
        illegalMoveCheck(color, button1);
        enableMoves(false);
    }
}

function rookSideMove(id, color, move) {
    if (document.getElementById(id).innerHTML !== "") {
        if ((color === white && whitePieces.includes(document.getElementById(id).innerHTML)) ||
            (color === black && blackPieces.includes(document.getElementById(id).innerHTML))) {
            return -1;
        }
        if ((color === white && blackPieces.includes(document.getElementById(id).innerHTML)) ||
            (color === black && whitePieces.includes(document.getElementById(id).innerHTML))) {
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
    rook1White = movedPiece("a1", whiteRook);
    rook2White = movedPiece("h1", whiteRook);
    rook1Black = movedPiece("a8", blackRook);
    rook2Black = movedPiece("h8", blackRook);
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
        illegalMoveCheck(color, button1);
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
        if ((color === white && whitePieces.includes(document.getElementById(id).innerHTML)) ||
            (color === black && blackPieces.includes(document.getElementById(id).innerHTML))) {
            return -1;
        } else if ((color === white && blackPieces.includes(document.getElementById(id).innerHTML)) ||
            (color === black && whitePieces.includes(document.getElementById(id).innerHTML))) {
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
    } else if ((color === white && blackPieces.includes(document.getElementById(id).innerHTML)) ||
        (color === black && whitePieces.includes(document.getElementById(id).innerHTML))) {
        possibleMove(id, move);
    }
    if (move === true) {
        illegalMoveCheck(color, button1);
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
    } else if ((color === white && blackPieces.includes(document.getElementById(id).innerHTML)) ||
        (color === black && whitePieces.includes(document.getElementById(id).innerHTML))) {
        possibleMove(id, move);
    }

    if (move === true) {
        illegalMoveCheck(color, button1);
        enableMoves(false);
    }
}

function kingMoved() {
    kingWhite = movedPiece("e1", whiteKing);
    kingBlack = movedPiece("e8", blackKing);
}

function castle(side, color) {
    switch (side) {
        case "right":
            switch (color) {
                case white:
                    castleRightMove("f1", "g1", rook2White, kingWhite, true, "e1", whiteCheck);
                    break;
                case black:
                    castleRightMove("f8", "g8", rook2Black, kingBlack, true, "e8", blackCheck);
                    break;
            }
            break;
        case "left":
            switch (color) {
                case white:
                    castleLeftMove("d1", "c1", "b1", rook1White, kingWhite, true, "e1", whiteCheck);
                    break;
                case black:
                    castleLeftMove("d8", "c8", "b8", rook1Black, kingBlack, true, "e8", blackCheck);
                    break;
            }
            break;
    }
    enableMoves(false);
}

function castleRightMove(block1, block2, rookMoved, kingMoved, move, king, check) {
    if (document.getElementById(block1).innerHTML === "" && document.getElementById(block2).innerHTML === "" &&
        !rookMoved && !kingMoved && button1.id === king && !check) {
        possibleMove(block2, move);
    }
}

function castleLeftMove(block1, block2, block3, rookMoved, kingMoved, move, king, check) {
    if (document.getElementById(block1).innerHTML === "" &&
        document.getElementById(block2).innerHTML === "" && document.getElementById(block3).innerHTML === "" &&
        !rookMoved && !kingMoved && button1.id === king && !check) {
        possibleMove(block2, move);
    }
}

function castleChosen(stButton, ndButton, side, color) {
    switch (side) {
        case "right":
            switch (color) {
                case white:
                    castleChosenMove(stButton, ndButton, "e1", "g1", "f1", "h1", whiteKing, whiteRook);
                    break;
                case black:
                    castleChosenMove(stButton, ndButton, "e8", "g8", "f8", "h8", blackKing, blackRook);
                    break;
            }
            break;
        case "left":
            switch (color) {
                case white:
                    castleChosenMove(stButton, ndButton, "e1", "c1", "d1", "a1", whiteKing, whiteRook);
                    break;
                case black:
                    castleChosenMove(stButton, ndButton, "e8", "c8", "d8", "a8", blackKing, blackRook);
                    break;
            }
            break;
    }
}

function castleChosenMove(stButton, ndButton, button1ID, button2ID, rookMove, corner, king, rook) {
    if ((stButton.id === button1ID && ndButton.id === button2ID)) {
        document.getElementById(button2ID).innerHTML = king;
        document.getElementById(rookMove).innerHTML = rook;
        document.getElementById(corner).innerHTML = "";
    }
}

function check() {
    whiteCheck = false;
    blackCheck = false;
    var whiteKingPosition = kingPosition(white);
    var blackKingPosition = kingPosition(black);
    letters.forEach(letter => numbers.forEach(number => {
        pieceCheckMate(letter + number, false);
        if (document.getElementById(whiteKingPosition).classList.contains("check")) {
            document.getElementById("Check").innerHTML = "Check to White";
            whiteCheck = true;
        }
        if (document.getElementById(blackKingPosition).classList.contains("check")) {
            document.getElementById("Check").innerHTML = "Check to Black";
            blackCheck = true;
        }
    }));
    if (!whiteCheck && !blackCheck && button2 !== null) {
        document.getElementById("Check").innerHTML = "";
        socket.emit("removeCheck", roomId);
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

function illegalMoveCheck(color, button) {
    var prevWhiteCheck = whiteCheck;
    var prevBlackCheck = blackCheck;
    var possibleMoves = document.querySelectorAll(".possibleMove");

    possibleMoves.forEach(move => {
        var html = move.innerHTML;
        move.innerHTML = button.innerHTML;
        button.innerHTML = "";
        whiteCheck = false;
        blackCheck = false;
        letters.forEach(letter1 => numbers.forEach(number1 => {
            document.getElementById(letter1 + number1).classList.remove("check");
        }))
        check();
        if ((color === white && whiteCheck) || (color === black && blackCheck)) {
            move.classList.remove("possibleMove");
        }
        button.innerHTML = move.innerHTML;
        move.innerHTML = html;
        whiteCheck = prevWhiteCheck;
        blackCheck = prevBlackCheck;
        if (!whiteCheck && !blackCheck) {
            document.getElementById("Check").innerHTML = "";
        } else if (whiteCheck) {
            document.getElementById("Check").innerHTML = "Check to White";
        } else if (blackCheck) {
            document.getElementById("Check").innerHTML = "Check to Black";
        }
    });
}

function checkMate() {
    var mate = document.getElementById("Checkmate");
    var prevWhiteCheck = whiteCheck;
    var prevBlackCheck = blackCheck;
    resetBoardColor();
    if (whiteCheck || blackCheck) {
        letters.forEach(letter => numbers.forEach(number => {
            if (whiteCheck && pieceColor(letter + number) === white) {
                pieceCheckMate(letter + number, -1);
                addCheckMoves();
            }
            if (blackCheck && pieceColor(letter + number) === black) {
                pieceCheckMate(letter + number, -1);
                addCheckMoves();
            }
        }))
        console.log(checkMoves);
        setBoard();
        if (whiteCheck) {
            checkMoves.forEach(move => {
                document.getElementById(move).innerHTML = whitePawn;
            })
        }
        if (blackCheck) {
            checkMoves.forEach(move => {
                document.getElementById(move).innerHTML = blackPawn;
            })
        }
        whiteCheck = false;
        blackCheck = false;
        letters.forEach(letter1 => numbers.forEach(number1 => {
            document.getElementById(letter1 + number1).classList.remove("check");
        }))
        check();
        if (prevWhiteCheck && whiteCheck) {
            mate.innerHTML = "Checkmate! Black Wins!";
            socket.emit('checkmate', roomId, mate.innerHTML);
            seconds = -2;
            clearInterval(countdown);
            getBoard();
            return;
        }
        if (prevBlackCheck && blackCheck) {
            mate.innerHTML = "Checkmate! White Wins!";
            socket.emit('checkmate', roomId, mate.innerHTML);
            seconds = -2;
            clearInterval(countdown);
            getBoard();
            return;
        }
        getBoard();
    }
}

function pieceCheckMate(id, bool) {
    switch (document.getElementById(id).innerHTML) {
        case whitePawn:
            pawn(id, white, bool);
            break;
        case blackPawn:
            pawn(id, black, bool);
            break;
        case whiteRook:
            rook(id, white, bool);
            break;
        case blackRook:
            rook(id, black, bool);
            break;
        case whiteBishop:
            bishop(id, white, bool);
            break;
        case blackBishop:
            bishop(id, black, bool);
            break;
        case whiteQueen:
            queen(id, white, bool);
            break;
        case blackQueen:
            queen(id, black, bool);
            break;
        case whiteKnight:
            knight(id, white, bool);
            break;
        case blackKnight:
            knight(id, black, bool);
            break;
        case whiteKing:
            knight(id, white, bool);
            break;
        case blackKing:
            knight(id, black, bool);
            break;
        default:
            break;
    }
}

function movedPiece(id, piece) {
    if (document.getElementById(id).innerHTML !== piece) {
        return true;
    }
}

function possibleMove(id, move) {
    if (move === true) {
        document.getElementById(id).classList.add("possibleMove");
    } else if (move === false) {
        document.getElementById(id).classList.add('check');
    } else if (move === -1) {
        document.getElementById(id).classList.add('checkMate');
    } else {
        document.getElementById(id).classList.add('ai');
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
            document.getElementById(element + element1).classList.remove("checkMate");
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

function setBoard() {
    letters.forEach(letter => numbers.forEach(number => {
        board.push(document.getElementById(letter + number).innerHTML);
    }))
}

function getBoard() {
    var boardi = 0;
    letters.forEach(letter => numbers.forEach(number => {
        document.getElementById(letter + number).innerHTML = board[boardi];
        boardi++;
    }))
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
    const white = "white";
    const black = "black";
    if (change) {
        seconds = moveInterval;
    }
    var turn = document.getElementById('Turn');

    letters.forEach(element => numbers.forEach(element1 => {
        if ((turn.innerHTML === "White's Turn" && boardColor === white &&
                whitePieces.includes(document.getElementById(element + element1).innerHTML)) ||
            (turn.innerHTML === "Black's Turn" && boardColor === black &&
                blackPieces.includes(document.getElementById(element + element1).innerHTML))) {
            document.getElementById(element + element1).disabled = false;
        } else {
            document.getElementById(element + element1).disabled = true;
        }
    }));
}

function pieceColor(id) {
    if (whitePieces.includes(document.getElementById(id).innerHTML)) {
        return white;
    }
    if (blackPieces.includes(document.getElementById(id).innerHTML)) {
        return black;
    }
    return "empty";
}

function addCheckMoves() {
    letters.forEach(letter => numbers.forEach(number => {
        if (document.getElementById(letter + number).classList.contains("checkMate") && !checkMoves.includes(letter + number)) {
            checkMoves.push(letter + number);
        }
    }))
}

function removeCheckMoves(id) {
    if (checkMoves.includes(id)) {
        var index = checkMoves.indexOf(id);
        checkMoves.splice(index, 1);
    }
}

function movesHistory(to, bool) {
    var historyMoves = document.getElementById('HistoryMoves');
    var addNumber = !addLine ? addNumber = turnRotation.toString() + ". " : addNumber = "";
    var kill = button2HTML === "" ? kill = "" : kill = "x"
    var br = addLine ? br = "<br>" : br = " ";
    var line = addNumber + pieceNota(to.id) + kill + to.id + br;
    historyMoves.innerHTML += line;
    if (addLine) {
        addLine = false;
        turnRotation++;
    } else {
        addLine = true;
    }

    if (bool) {
        socket.emit('movesHistory', roomId, historyMoves.innerHTML, turnRotation, addLine);
    }
}

function pieceNota(id) {
    switch (document.getElementById(id).innerHTML) {
        case whitePawn:
            return "";
        case blackPawn:
            return "";
        case whiteRook:
            return "R";
        case blackRook:
            return "R";
        case whiteKnight:
            return "N";
        case blackKnight:
            return "N";
        case whiteBishop:
            return "B";
        case blackBishop:
            return "B";
        case whiteQueen:
            return "Q";
        case blackQueen:
            return "Q";
        case whiteKing:
            return "K";
        case blackKing:
            return "K";
        default:
            return false;
    }
}

function pieceKill() {
    var whiteKill = document.getElementById("WhiteKill");
    var blackKill = document.getElementById("BlackKill");

    if (button2.id !== button1.id) {
        if (button2.innerHTML !== "" && whitePieces.includes(button1.innerHTML)) {
            blackKill.innerHTML += button2.innerHTML + ", ";
        }
        if (button2.innerHTML !== "" && blackPieces.includes(button1.innerHTML)) {
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
    document.getElementById('Check').innerHTML = "";
    document.getElementById('Checkmate').innerHTML = "";
    resetBoard();
    resetBoardColor();
    seconds = -2;
    boardColor = white;
    document.getElementById("Color").innerHTML = "Color: " + boardColor;
}

function exportMove() {
    var move;
    if (blackPieces.includes(button2.innerHTML)) {
        move = "b" + button1.id + button2.id;
    } else if (whitePieces.includes(button2.innerHTML)) {
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
    check();
    fromButton.innerHTML = "";
    switchHTML();
    castleChosen(fromButton, toButton, "right", white);
    castleChosen(fromButton, toButton, "left", white);
    castleChosen(fromButton, toButton, "right", black);
    castleChosen(fromButton, toButton, "left", black);
    fromButton.classList.add("lastMove");
    toButton.classList.add("lastMove");
    fromButton = null;
    toButton = null;
}