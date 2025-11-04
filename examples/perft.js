import { Chesster } from "../dist/index.js";

const DEPTH = 5;

/**
 * recursively counts all positions (leaf nodes) at a given search depth
 *
 * @param game - the chess game instance to test
 * @param depth - depth to simulate to
 * @returns total number of positions at given depth
 */
function perft(game, depth) {
    if (depth === 0) return 1;

    const moves = game.moves();
    let count = 0;

    for (const move of moves) {
        game.move(move);
        count += perft(game, depth - 1);
        game.undo();
    }

    return count;
}

console.log(`calculating moves for depth: ${DEPTH}`);
const positions = perft(new Chesster(), DEPTH);
console.log(positions);
