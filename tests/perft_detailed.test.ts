import { describe, expect, test, beforeAll } from "vitest";
import { Chesster } from "../src/index";

/**
 * detailed perft (performance test) for chess engine correctness validation
 * see: https://www.chessprogramming.org/Perft_Results
 */

// maximum search depth for testing
const MAX_DEPTH = 5;

/**
 * known perft results at various depths from standard starting position
 * source: https://www.chessprogramming.org/Perft_Results#Initial_Position
 */
const EXPECTED_DIVIDE_VALUES: Record<number, PerftDetailedResults> = {
    1: {
        positions: 20,
        captures: 0,
        enPassant: 0,
        castles: 0,
        promotions: 0,
        checks: 0,
        checkmates: 0,
    },
    2: {
        positions: 400,
        captures: 0,
        enPassant: 0,
        castles: 0,
        promotions: 0,
        checks: 0,
        checkmates: 0,
    },
    3: {
        positions: 8_902,
        captures: 34,
        enPassant: 0,
        castles: 0,
        promotions: 0,
        checks: 12,
        checkmates: 0,
    },
    4: {
        positions: 197_281,
        captures: 1_576,
        enPassant: 0,
        castles: 0,
        promotions: 0,
        checks: 469,
        checkmates: 8,
    },
    5: {
        positions: 4_865_609,
        captures: 82_719,
        enPassant: 258,
        castles: 0,
        promotions: 0,
        checks: 27_351,
        checkmates: 347,
    },
    6: {
        positions: 119_060_324,
        captures: 2_812_008,
        enPassant: 5_248,
        castles: 0,
        promotions: 0,
        checks: 809_099,
        checkmates: 10_828,
    },
};

interface PerftDetailedResults {
    positions: number;
    captures: number;
    enPassant?: number;
    castles?: number;
    promotions?: number;
    checks: number;
    checkmates: number;
}

function perft(
    game: Chesster,
    depth: number,
    result: PerftDetailedResults
): void {
    if (depth === 0) {
        result.positions++;

        if ((game.turnHistory[game.turnHistory.length - 1] >>> 20) & 0b1111)
            result.captures++;

        if (game.white.isChecked || game.black.isChecked) result.checks++;

        if (game.white.isCheckmated || game.black.isCheckmated)
            result.checkmates++;

        return;
    }

    const moves = game.moves();

    for (const move of moves) {
        game.move(move);
        perft(game, depth - 1, result);
        game.undo();
    }
}

describe(`detailed move generation (perft) testing (max depth: ${MAX_DEPTH})`, () => {
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        const expected = EXPECTED_DIVIDE_VALUES[depth];

        if (expected === undefined) {
            console.error(
                `current depth ${depth} is an unexpected perft value`
            );
            return;
        }

        ////////////////////////////
        // GENERATE PERFT RESULTS //
        ////////////////////////////

        const result: PerftDetailedResults = {
            positions: 0,
            captures: 0,
            checks: 0,
            checkmates: 0,
        };

        //////////////////////////
        // COMPARE TEST RESULTS //
        //////////////////////////

        describe(`depth ${depth}`, () => {
            beforeAll(() => {
                const game = new Chesster();
                perft(game, depth, result);
            }, 30000);

            test(`depth ${depth} should generate ${expected.positions.toString()} positions`, () => {
                expect(result.positions).toBe(expected.positions);
            });

            test(`depth ${depth} should count ${expected.captures.toString()} captures`, () => {
                expect(result.captures).toBe(expected.captures);
            });

            test(`depth ${depth} should count ${expected.checks.toString()} checks`, () => {
                expect(result.checks).toBe(expected.checks);
            });

            test(`depth ${depth} should count ${expected.checkmates.toString()} checkmates`, () => {
                expect(result.checkmates).toBe(expected.checkmates);
            });
        });
    }
});
