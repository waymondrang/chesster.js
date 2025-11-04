import { describe, expect, test } from "vitest";
import { Chesster } from "../src/index";

/**
 * simple perft (performance test) for chess engine correctness validation
 * see: https://www.chessprogramming.org/Perft_Results
 */

// maximum search depth for testing
const MAX_DEPTH = 5;

/**
 * known position counts at each depth from starting position
 * source: https://www.chessprogramming.org/Perft_Results#Initial_Position
 */
const EXPECTED_PERFT_VALUES: Record<number, number> = {
    1: 20,
    2: 400,
    3: 8_902,
    4: 197_281,
    5: 4_865_609,
    6: 119_060_324,
    7: 3_195_901_860,
};

/**
 * recursively counts all positions (leaf nodes) at a given search depth
 *
 * @param game - the chess game instance to test
 * @param depth - depth to simulate to
 * @returns total number of positions at given depth
 */
function perft(game: Chesster, depth: number): number {
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

describe(`simple move generation (perft) testing (max depth: ${MAX_DEPTH})`, () => {
    // generate and test each depth sequentially
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        const expected = EXPECTED_PERFT_VALUES[depth];

        if (expected === undefined) {
            console.error(
                `current depth ${depth} is an unexpected perft value`
            );
            return;
        }

        test(`depth ${depth} should generate ${EXPECTED_PERFT_VALUES[
            depth
        ].toString()} positions`, () => {
            const game = new Chesster();
            const positions = perft(game, depth);
            expect(positions).toBe(expected);
        }, 30000); // timeout
    }
});
