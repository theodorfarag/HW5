// Import the core Scrabble game logic
import { Scrabble } from "./Scrabble.js";

// Base path for Scrabble tile images (letter appended dynamically)
const IMAGE_PATHWAY = './graphics_data/Scrabble_Tiles/Scrabble_Tile_'; // {letter}.jpg

// Create a new game instance
const game = new Scrabble();

// Set to store dictionary words for O(1) lookup
let dictionary = new Set();

// Reference to the error message UI element
const errorMessage = $("#error-msg");



/**
 * Loads the dictionary file asynchronously and stores
 * each word in a Set for fast validation.
 */
function loadDictionary() {
    $.get("./graphics_data/dictionary.txt", (data) => {

        // Split file contents by line (handles Windows & Unix line endings)
        const lines = data.split(/\r?\n/);

        // Normalize words and store in the dictionary
        for (const word of lines) {
            if (word.trim() !== "") {
                dictionary.add(word.trim().toLowerCase());
            }
        }

    }).fail(() => {
        console.log("Failed to load in the dictionary");
    });
}



/**
 * Syncs all UI labels with the current game state.
 * This is called after every board or hand update.
 */
function updateLabels() {
    // Reconstruct the word currently on the board
    game.findWord();

    // Only compute score if the word is valid
    if (dictionary.has(game.currWord.toLowerCase())) {
        game.computeScore(game.currWord);
    } else {
        game.addedPoints = 0;
    }

    // Update UI elements
    $('#tile-count').text(`Tiles Left: ${game.tilesRemaining}`);
    $('#current-score').text(`Current Score: ${game.currScore} (+${game.addedPoints ?? 0})`);
    $('#high-score').text(`High Score: ${game.highScore}`);
    $('#curr-word').text(`Word: ${game.currWord}`);
}



/**
 * Initializes the Scrabble board drop zones.
 * Each drop square is assigned an index (0–14).
 */
function setUpGameBoard() {
    for (let i = 0; i < 15; i++) {

        // Store the board index directly on the DOM element
        $(`#drop-${i}`).data("index", i);

        // Make the board square droppable
        $(`#drop-${i}`).droppable({
            tolerance: "fit",
            classes: {
                "ui-droppable-active": "border-amber-950 border-1",
            },

            // Handle tile placement on drop
            drop: function (event, ui) {
                const tile = ui.draggable;

                // Snap tile visually to the drop square
                tile.position({
                    of: $(this),
                });
            }
        });
    }
}



/**
 * Updates the tile rack UI and syncs it with the game state.
 * Status determines whether this is a new hand, reset, or next turn.
 */
function setTileRack(status) {
    // Update game logic for the requested action
    game.newHand(status);

    // Clear the tile rack UI
    $("#tiles-container").html("");
    $("#tiles-container").data("index", -1);

    // Make the tile rack a valid drop target
    $("#tiles-container").droppable({
        tolerance: "fit"
    });

    // Create draggable tiles based on the current hand
    for (let [letter, data] of Object.entries(game.tileHand)) {
        for (let j = 0; j < data.amount; j++) {

            // Create tile image
            const tileImage = $('<img>', {
                src: `${IMAGE_PATHWAY}${letter === "_" ? "Blank" : letter}.jpg`,
                class: 'tile',
                alt: `${letter} tile`,
            });

            // Store tile metadata directly on the element
            tileImage.data('letter', letter);
            tileImage.data('value', data);
            tileImage.data('curr-location', "tiles-container");

            // Enable drag-and-drop behavior
            tileImage.draggable({
                containment: "document",

                /**
                 * Revert logic controls whether the tile snaps back
                 * or stays where it was dropped.
                 */
                revert: function (dropped) {
                    if (!dropped) return true;

                    const prev_loc = $(this).data("curr-location");
                    const index = $(dropped).data('index');

                    // Tile returned to rack
                    if (index < 0) {
                        game.boardWord[prev_loc] = undefined;
                        $(this).data("curr-location", "tiles-container");
                        updateLabels();
                        return false;
                    }

                    // Tile placed on an empty board square
                    if (prev_loc !== index && !game.boardWord[index]) {
                        game.boardWord[prev_loc] = undefined;
                        game.boardWord[index] = $(this).data('letter');
                        $(this).data("curr-location", index);
                        updateLabels();
                        return false;
                    }

                    // Invalid placement → revert
                    return true;
                },

                snap: ".drop",
                cursor: "move",
            });

            // Add tile to the rack
            $("#tiles-container").append(tileImage);
        }
    }

    // Refresh labels after rack setup
    updateLabels();
}



/**
 * Main entry point — runs once the DOM is ready.
 */
$(function () {

    loadDictionary();
    setTileRack();
    setUpGameBoard();

    // Handle "Next" button (submit word)
    $('#next').on("click", () => {
        if (dictionary.has(game.currWord.toLowerCase())) {
            game.setScore();
            setTileRack("next");
            errorMessage.addClass("hidden");
        } else {
            errorMessage
                .text("Error: Invalid word. Please enter a valid English word.")
                .removeClass("hidden");
        }

        updateLabels();
    });

    // Handle "New Hand" button
    $("#new-hand").on('click', () => {
        errorMessage.addClass('hidden');
        setTileRack("new-hand");
        updateLabels();
    });

    // Handle "Reset" button
    $('#reset').on("click", () => {
        errorMessage.addClass('hidden');
        setTileRack("reset");
        updateLabels();
    });
});
