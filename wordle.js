/*
Objective:
1. Get the colours for every alphabet (keyboard highlights)
2. Learn about objects (aka dictionary in python)
*/
const answerList = ["Apple", "Mango","Tiger","Happy","Beach",
"House","Music","Pizza","Sunny","Earth","Smile","Chair","Lemon","Ocean","Robot","Cloud","Ghost","Mouse","Sleep","Water"];

let wordList = {valid: [], playable : {}};

 
const rating = {
    unknown :0,
    absent: 1,
    present: 2,
    correct: 3,
};
// current guess = P  A  P  E  R
// answer        = A  P  P  L  E
//result         =yellow yellow green yellow grey

//Keyboards...keys...alphabets....dictionary!!!
//["a","b","c",....]
//["present", "unknown","absent"...]
//{a:"present", b :"unknown", c:"absent"}

function startGame(round) {
    let {
        attemptCount,
        userAttempts,
        highlightedRows,
        keyboard,
        answer,
        status,
    } = loadOrStartGame();

    while (attemptCount <= round && status ===  "in-progress") {
        let currentGuess = prompt("Guess a five-letter word: ");
        //check if word is in word list
        if (isInputCorrect(currentGuess)) {
            //absent(grey), present (yellow), correct (green)
            const highlightedCharacters = getCharactersHighlight(
                currentGuess,
                answer
            );
            highlightedRows.push(highlightedCharacters);
            keyboard = updateKeyboardHighlights (
                keyboard,
                currentGuess,
                highlightedCharacters
            );
            status = updateGameStatus(
                currentGuess,
                answer,
                attemptCount,
                round -1
            );
            attemptCount++;
            saveGame({
                attemptCount,
                userAttempts,
                highlightedRows,
                keyboard,
                status,
            });
        } else {
            retry(currentGuess);
        }
    }
    if (status === "success") {
        alert("Congratulations");
    } else {
        alert(`The word is ${answer}`);
    }
}

function isInputCorrect(word) {
    return wordList.includes(word) || wordList.valid.includes(word);
}
function retry(word){
    alert(`${word} is not in the word list`);
}

function getCharactersHighlight(word,answer){
    //split characters
    const wordSplit = word.split("");
    const result = [];

    //check the order of the characters
    wordSplit.forEach((character, index) => {
        if (character === answer[index]) {
            //correct = index of word equal to index of answer
            result.push("correct");
        } else if (answer.includes(character)) {
            //present = if not correct, character is part of answer
            result.push("present");
        } else {
            //absent, = else, it must be absent
            result.push("absent")
        }
    });
    return result;
}

function getKeyboard() {
    const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");
    const entries = [];
    for (const alphabet of alphabets) {
        entries.push([alphabet,"unknown"]);
    }
    return Object.fromEntries(entries);
}

function updateKeyboardHighlights(keyboard, currentGuess, highlightedCharacters ){
    const newKeyboard = Object.assign({}, keyboard);

    for ( let i = 0; i <highlightedCharacters.length; i++){
        const character = userInput[i]; //userInput = apple , userInput[0] = a
        const nextStatus = highlightedCharacters[i]; //absent
        const nextRating = rating[nextStatus];  //1
        const previousStatus = newKeyboard[character]; //unknown
        const previousRating = rating[previousStatus]; //0
        //if previous color is yellow, and new colour is green, final colour? green
        // if previous color is green, and new colour is yellow, final colour? green
        if (nextRating > previousRating) {
            newKeyboard[character] = nextStatus;
        }
    }
    return newKeyboard;
}

function updateGameStatus(currentGuess, answer, attemptCount,round){
    if(currentGuess === answer) {
        return "success";
    } 
    if (attemptCount === round) {
        return "failure";
    }
    return "in-progress";
}

function saveGame (gameState) {
    window.localStorage.setItem("PREFACE_WORDLE", JSON.stringify(gameState));
}

function getTodaysAnswer () {
    const offsetFromDate = new Date(2023,0,1).getTime();
    const today = new Date().getTime();
    const msOffset = today - offsetFromDate;
    const daysOffset = msOffset /1000/60/60/24;
    const answerIndex = Math.floor(daysOffset);
    return wordList.playable[answerIndex];
}
function isToday (timestamp) {
    const today = new Date();
    const check = new Date(timestamp);
    return today.toDateString() === check.toDateString();
}
    
async function loadOrStartGame(debug){
    wordList = await fetch("./src/fixtures/words.json")
        .then(response => {
            return response.json();
        })
        .then(json => {
            return json;
        });

    let answer;
    if (debug) {
        answer = answerList[0];
    } else {
        answer = getTodaysAnswer();
    }
    const prevGame = JSON.parse(window.localStorage.getItem("PREFACE_WORDLE"));
    if (prevGame && isToday(prevGame.timestamp)) {
        return {
                ...prevGame,
                answer,
        };
    }
    return {
        attemptCount :0,
        userAttempts:[],
        highlightedRows : [],
        keyboard :getKeyboard(),
        answer,
        status: "in-progress",
    };
}
