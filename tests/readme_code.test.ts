import { describe, expect, test } from "@jest/globals";
import { Chesster } from "../src/index";

/**
 * sanity checks for examples in readme.md
 * ensures that documentation examples are at least functional
 */

describe("readme.md sanity checks", () => {
    test("create a new game", () => {
        const game = new Chesster();
        const moves = game.moves();

        const turn = game.turn;

        game.move(moves[0]);
        game.undo();

        expect(game.turn).toBe(turn); // turn should be same
        expect(game.isGameOver()).toBe(false); // game should not be over
    });
});
