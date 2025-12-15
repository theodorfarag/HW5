/**
 * Author: Theodor Farag
 * Course: COMP.4630 – Mobile App Development I
 * Assignment: HW5 – Scrabble Game
 *
 * Description:
 * Core source file for the Scrabble web application.
 *
 * Contact:
 * Email: theodor_farag@uml.edu
 */


// Scrabble game logic class
export class Scrabble {

    // Public game state variables
    highScore;
    currScore;
    currTiles;
    currWord;
    addedPoints;
    tileHand = {};
    tilesRemaining;
    wordStartingIndex;

    // Board state (fixed-length for a single row Scrabble variant)
    boardPowerUp = new Array(15);
    boardWord = new Array(15);
    

    /**
     * Private tile distribution data
     * Represents the official Scrabble tile counts and values
     */
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

    /**
     * Private lookup table for letter scoring
     * Allows O(1) score calculation per letter
     */
    #scoreMap = {
        "A":1, "B":3, "C":3, "D":2, "E":1,
        "F":4, "G":2, "H":4, "I":1, "J":8,
        "K":5, "L":1, "M":3, "N":1, "O":1,
        "P":3, "Q":10, "R":1, "S":1, "T":1,
        "U":1, "V":4, "W":4, "X":8, "Y":4,
        "Z":10, "_":0
    };

    /**
     * Initializes game state and board bonuses
     */
    constructor() {
        this.highScore = 0;
        this.currScore = 0;
        this.currWord = '';

        // Deep copy of tile data to avoid mutating original distribution
        this.currTiles = this.#tileData.map(tile => ({ ...tile }));

        // Track total tiles remaining in the bag
        this.tilesRemaining = this.currTiles.reduce(
            (sum, tile) => sum + tile.amount, 0
        );

        // Initialize fixed board power-up locations
        this.boardPowerUp[2] = "DW";
        this.boardPowerUp[12] = "DW";
        this.boardPowerUp[6] = "DL";
        this.boardPowerUp[8] = "DL";
    }



    /**
     * Fully resets the game state
     */
    #resetGame() {
        this.currTiles = this.#tileData.map(tile => ({ ...tile }));
        this.tileHand = {};
        this.currScore = 0;
    }



    /**
     * Returns all tiles from the player's hand
     * back into the tile pool (used for "new hand")
     */
    #newHandState() {
        for (let [letter, data] of Object.entries(this.tileHand)) {
            this.currTiles.push({
                "letter": letter,
                "amount": data.amount,
                "value": data.value
            });
        }
        this.tileHand = {};
    }



    /**
     * Removes used board tiles from the player's hand
     * after successfully submitting a word
     */
    #nextWord() {
        for (let i = 0; i < this.boardWord.length; i++) {
            if (this.boardWord[i]) {
                this.tileHand[this.boardWord[i]].amount -= 1;

                // Remove letter entry if count reaches zero
                if (this.tileHand[this.boardWord[i]].amount <= 0) {
                    delete this.tileHand[this.boardWord[i]];
                }
            }
        }
    }



    /**
     * Generates a new tile hand based on the game state
     * Handles reset, new hand, and next word scenarios
     */
    newHand(status) {
        if (status === "reset") this.#resetGame();
        if (status === "new-hand") this.#newHandState();
        if (status === "next") this.#nextWord();

        // Create a working copy of remaining tiles
        let availableTiles = this.currTiles.map(tile => ({ ...tile }));

        // Clear board for next play
        this.boardWord = new Array(15);

        // Count tiles currently in the player's hand
        let tileHandLength = 0;
        for (let data of Object.values(this.tileHand)) {
            tileHandLength += data.amount;
        }

        // Draw tiles until hand has 7 total
        for (let i = 0; i < (7 - tileHandLength); i++) {
            const num = Math.floor(Math.random() * availableTiles.length);
            const currentTile = availableTiles[num];

            const currLetter = currentTile.letter;
            const currValue = currentTile.value;

            // Add tile to hand
            if (currLetter in this.tileHand) {
                this.tileHand[currLetter].amount += 1;
            } else {
                this.tileHand[currLetter] = { value: currValue, amount: 1 };
            }

            // Remove tile from pool
            availableTiles[num].amount -= 1;
            availableTiles = availableTiles.filter(t => t.amount > 0);

            if (availableTiles.length <= 0) break;
        }

        // Update remaining tile pool and count
        this.currTiles = availableTiles;
        this.tilesRemaining = this.currTiles.reduce(
            (sum, tile) => sum + tile.amount, 0
        );
    }



    /**
     * Adds the most recently computed points to the score
     * and updates high score if needed
     */
    setScore() {
        this.currScore += this.addedPoints;
        if (this.currScore > this.highScore) {
            this.highScore = this.currScore;
        }
    }



    /**
     * Computes the score for the current word,
     * including letter and word multipliers
     */
    computeScore(word) {
        let runningScore = 0;
        let doublePointWord = false;

        for (let i = 0; i < word.length; i++) {
            const currLetter = word.charAt(i).toUpperCase();
            runningScore += this.#scoreMap[currLetter];

            // Apply board bonuses
            if (this.boardPowerUp[this.wordStartingIndex + i] === "DL") {
                runningScore += this.#scoreMap[currLetter];
            }
            if (this.boardPowerUp[this.wordStartingIndex + i] === "DW") {
                doublePointWord = true;
            }
        }

        if (doublePointWord) runningScore *= 2;
        this.addedPoints = runningScore;
    }



    /**
     * Scans the board and constructs the current word
     * based on contiguous placed letters
     */
    findWord() {
        let l = 0;
        let r = 0;
        let gameWord = "";
        let charFlag = false;

        // Find leftmost and rightmost placed letters
        for (let i = 0; i < this.boardWord.length; i++) {
            if (this.boardWord[i] && charFlag) {
                r = i;
            } else if (this.boardWord[i]) {
                l = i;
                charFlag = true;
            }
        }

        this.wordStartingIndex = l;

        // Build the word string (with gaps represented by '-')
        while (l <= r) {
            if (this.boardWord[l]) {
                gameWord += this.boardWord[l];
            } else {
                gameWord += "-";
            }
            l++;
        }

        this.currWord = gameWord;
    }
}
