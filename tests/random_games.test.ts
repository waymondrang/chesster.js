import { describe, expect, test } from "vitest";
import { Chesster } from "../src/index";

const NUM_GAMES = 100;
const TEST_TIMEOUT = 15000;

// note: games should not go on forever as fivefold repetition will trigger a draw

describe("random games fuzzing", () => {
    test(
        `play ${NUM_GAMES} games where player picks a random move`,
        () => {
            for (let i = 0; i < NUM_GAMES; i++) {
                const game = new Chesster();

                while (!game.isGameOver()) {
                    const moves = game.moves();

                    expect(moves.length).toBeGreaterThan(0); // sanity check

                    // pick a random legal move
                    const mv = moves[Math.floor(Math.random() * moves.length)];

                    // sanity check (query) the move
                    expect(game.queryMove(mv)).toBe(true);

                    game.move(mv);
                }
            }
        },
        TEST_TIMEOUT
    );

    test(
        `play ${NUM_GAMES} games where player picks the first move`,
        () => {
            for (let i = 0; i < NUM_GAMES; i++) {
                const game = new Chesster();

                while (!game.isGameOver()) {
                    const moves = game.moves();

                    expect(moves.length).toBeGreaterThan(0); // sanity check

                    // pick the first legal move
                    const mv = moves[0];

                    // sanity check (query) the move
                    expect(game.queryMove(mv)).toBe(true);

                    game.move(mv);
                }
            }
        },
        TEST_TIMEOUT
    );

    test(
        `play ${NUM_GAMES} games where player picks the last move`,
        () => {
            for (let i = 0; i < NUM_GAMES; i++) {
                const game = new Chesster();

                while (!game.isGameOver()) {
                    const moves = game.moves();

                    expect(moves.length).toBeGreaterThan(0); // sanity check

                    // pick the last legal move
                    const mv = moves[moves.length - 1];

                    // sanity check (query) the move
                    expect(game.queryMove(mv)).toBe(true);

                    game.move(mv);
                }
            }
        },
        TEST_TIMEOUT
    );
});
