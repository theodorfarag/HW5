export class Scrabble {
    highScore;
    currScore;
    currTiles;
    currWord;
    addedPoints;
    tileHand = {};
    tilesRemaining;
    wordStartingIndex;
    boardPowerUp = new Array(15);
    boardWord = new Array(15);
    

    #tileData = [
	{"letter":"A", "value":1,  "amount":9},
	{"letter":"B", "value":3,  "amount":2},
	{"letter":"C", "value":3,  "amount":2},
	{"letter":"D", "value":2,  "amount":4},
	{"letter":"E", "value":1,  "amount":12},
	{"letter":"F", "value":4,  "amount":2},
	{"letter":"G", "value":2,  "amount":3},
	{"letter":"H", "value":4,  "amount":2},
	{"letter":"I", "value":1,  "amount":9},
	{"letter":"J", "value":8,  "amount":1},
	{"letter":"K", "value":5,  "amount":1},
	{"letter":"L", "value":1,  "amount":4},
	{"letter":"M", "value":3,  "amount":2},
	{"letter":"N", "value":1,  "amount":6},
	{"letter":"O", "value":1,  "amount":8},
	{"letter":"P", "value":3,  "amount":2},
	{"letter":"Q", "value":10, "amount":1},
	{"letter":"R", "value":1,  "amount":6},
	{"letter":"S", "value":1,  "amount":4},
	{"letter":"T", "value":1,  "amount":6},
	{"letter":"U", "value":1,  "amount":4},
	{"letter":"V", "value":4,  "amount":2},
	{"letter":"W", "value":4,  "amount":2},
	{"letter":"X", "value":8,  "amount":1},
	{"letter":"Y", "value":4,  "amount":2},
	{"letter":"Z", "value":10, "amount":1},
	{"letter":"_", "value":0,  "amount":2}
    ];

    #scoreMap = {
        "A":1,
        "B":3,
        "C":3,
        "D":2,
        "E":1,
        "F":4,
        "G":2,
        "H":4,
        "I":1,
        "J":8,
        "K":5,
        "L":1,
        "M":3,
        "N":1,
        "O":1,
        "P":3,
        "Q":10,
        "R":1,
        "S":1,
        "T":1,
        "U":1,
        "V":4,
        "W":4,
        "X":8,
        "Y":4,
        "Z":10,
        "_":0
    }

    constructor() {
        this.highScore = 0;
        this.currScore = 0;
        this.currWord = '';
        // Deep copy 
        this.currTiles = this.#tileData.map((title) => {
            return {...title}
        })
        this.tilesRemaining = this.currTiles.reduce((sum, tile) => sum + tile.amount, 0);
        
        // rest of it is one line
        this.boardPowerUp[2] = "DW";
        this.boardPowerUp[12] = "DW";
        this.boardPowerUp[6] = "DL";
        this.boardPowerUp[8] = "DL";
    }

    #resetGame() {
        this.currTiles = this.#tileData.map((title) => {
            return {...title}
        })
        this.tileHand = {};
        this.currScore = 0;

    }
    #newHandState() {
        for(let [letter, data] of Object.entries(this.tileHand)) {
            this.currTiles.push({"letter":letter, "amount":data["amount"], "value":data["value"]})
        }
        this.tileHand = {};

    }


    #nextWord() {
        for (let i = 0; i < this.boardWord.length; i++) {
            if (this.boardWord[i]) {
                this.tileHand[this.boardWord[i]]["amount"] -= 1;
                if (this.tileHand[this.boardWord[i]] <= 0) {
                    
                    delete this.tileHand[this.boardWord[i]];
                }
            }
        }
        // this.tileHand.filter()
        console.log(this.tileHand)
    }

    newHand(status) {
        if (status == "reset") this.#resetGame();
        if (status == "new-hand") this.#newHandState();
        if (status == "next") this.#nextWord();

        let generatedTiles = {};
        let availableTiles = this.currTiles.map((title) => {
            return {...title}
        });
        this.boardWord = new Array(15);     
        let tileHandLength = 0;

        for(let data of Object.values(this.tileHand)) tileHandLength += data["amount"]; 

        for(let i = 0; i < (7 - tileHandLength); i++) {
            const num = Math.floor(Math.random() * (availableTiles.length));
            const currentTile = availableTiles[num];

            const currLetter = currentTile['letter'];
            const currValue = currentTile.value;

            if (currLetter in this.tileHand) {
                this.tileHand[currLetter].amount += 1; 
            } else {
                this.tileHand[currLetter] = {"value": currValue, "amount": 1}
            }

            availableTiles[num]["amount"] -= 1;
            availableTiles = availableTiles.filter(t => t["amount"] > 0);

            if (availableTiles.length <= 0) break;
        }
        // this.tileHand = generatedTiles;
        this.currTiles = availableTiles;
        this.tilesRemaining = this.currTiles.reduce((sum, tile) => sum + tile.amount, 0);


    }

    testNewHand() {
    for(let i = 0; i < 15; i++) {
        this.newHand();
        const tiles = this.currTiles
        
        console.log(`Round ${i + 1}:`);
        console.log("Generated:", this.tileHand);
        console.log("Remaining tiles:", tiles);
        
        // Check total tiles remaining
        const tilesRemaining = tiles.reduce((sum, tile) => sum + tile.amount, 0);
        console.log(`Total tiles left: ${tilesRemaining}`);
    }
}

    setScore() {
        this.currScore += this.addedPoints;
        if (this.currScore > this.highScore) this.highScore = this.currScore;
    }

    computeScore(word) {
        let runningScore = 0;
        let currLetter;
        let doublePointWord = false;
        

        for(let i = 0; i < word.length; i++) {
            currLetter = word.charAt(i).toUpperCase();
            runningScore += this.#scoreMap[currLetter]
            if (this.boardPowerUp[this.wordStartingIndex + i] == "DL") runningScore += this.#scoreMap[currLetter];
            if (this.boardPowerUp[this.wordStartingIndex + i] == "DW") doublePointWord = true;
        }
        if (doublePointWord) runningScore *= 2;
        this.addedPoints = runningScore;
        
    }

    findWord() {
        let l = 0;
        let r = 0;
        let gameWord = "";
        let charFlag = false;
        for (let i = 0; i < this.boardWord.length; i++) {
            if (this.boardWord[i] && charFlag) {
                r = i;
            } else if(this.boardWord[i]) {
                l = i;
                charFlag = true;
            }
        }
        // if one letter this doesn't work
        this.wordStartingIndex = l;
        while(l <= r ) {
            if (this.boardWord[l]) {
                gameWord += this.boardWord[l];
            } else {
                gameWord += "-";

            }
            this.boardWord[l];
            l++;
        }

        this.currWord = gameWord;
    }
}