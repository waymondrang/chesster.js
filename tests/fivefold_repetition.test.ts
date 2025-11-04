import { describe, expect, test } from "vitest";
import { Chesster } from "../src/index";

// todo: create fen string import tests

describe("automatic draw by fivefold repetition", () => {
    test("knight repetition only", () => {
        const game = new Chesster();
        expect(game.isDraw).toBe(false);

        // note: first time position occured (starting position)

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "g1" }); // white knight
        game.validateAndMoveObject({ from: "c6", to: "b8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: second time position occured

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "g1" }); // white knight
        game.validateAndMoveObject({ from: "c6", to: "b8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: third time position occured

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "g1" }); // white knight
        game.validateAndMoveObject({ from: "c6", to: "b8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: fourth time position occured

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "g1" }); // white knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c6", to: "b8" }); // black knight
        expect(game.isDraw).toBe(true);

        // note: fifth time position occured, draw
    });

    test("queen and bishop repetition with setup", () => {
        const game = new Chesster();
        expect(game.isDraw).toBe(false);

        ///////////
        // SETUP //
        ///////////

        game.validateAndMoveObject({ from: "e2", to: "e4" }); // white pawn
        game.validateAndMoveObject({ from: "e7", to: "e5" }); // black pawn
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "d1", to: "h5" }); // white queen
        game.validateAndMoveObject({ from: "f8", to: "a3" }); // black bishop
        expect(game.isDraw).toBe(false);

        //////////////////////
        // START REPETITION //
        //////////////////////

        // note: first time position occured

        game.validateAndMoveObject({ from: "h5", to: "d1" }); // white queen
        game.validateAndMoveObject({ from: "a3", to: "f8" }); // black bishop
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "d1", to: "h5" }); // white queen
        game.validateAndMoveObject({ from: "f8", to: "a3" }); // black bishop
        expect(game.isDraw).toBe(false);

        // note: second time position occured

        game.validateAndMoveObject({ from: "h5", to: "d1" }); // white queen
        game.validateAndMoveObject({ from: "a3", to: "f8" }); // black bishop
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "d1", to: "h5" }); // white queen
        game.validateAndMoveObject({ from: "f8", to: "a3" }); // black bishop
        expect(game.isDraw).toBe(false);

        // note: third time position occured

        game.validateAndMoveObject({ from: "h5", to: "d1" }); // white queen
        game.validateAndMoveObject({ from: "a3", to: "f8" }); // black bishop
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "d1", to: "h5" }); // white queen
        game.validateAndMoveObject({ from: "f8", to: "a3" }); // black bishop
        expect(game.isDraw).toBe(false);

        // note: fourth time position occured

        game.validateAndMoveObject({ from: "h5", to: "d1" }); // white queen
        game.validateAndMoveObject({ from: "a3", to: "f8" }); // black bishop
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "d1", to: "h5" }); // white queen
        game.validateAndMoveObject({ from: "f8", to: "a3" }); // black bishop
        expect(game.isDraw).toBe(true);

        // note: fifth time position occured, draw
    });

    test("knight repetition with setup", () => {
        const game = new Chesster();
        expect(game.isDraw).toBe(false);

        ///////////
        // SETUP //
        ///////////

        game.validateAndMoveObject({ from: "e2", to: "e4" }); // white pawn
        game.validateAndMoveObject({ from: "e7", to: "e5" }); // black pawn
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "e5" }); // white knight (capture black pawn)
        game.validateAndMoveObject({ from: "f8", to: "c5" }); // black bishop
        expect(game.isDraw).toBe(false);

        //////////////////////
        // START REPETITION //
        //////////////////////

        // note: first time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: second time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: third time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: fourth time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(true);

        // note: fifth time position occured, draw
    });

    test("interrupted knight repetition with setup", () => {
        const game = new Chesster();
        expect(game.isDraw).toBe(false);

        ///////////
        // SETUP //
        ///////////

        game.validateAndMoveObject({ from: "e2", to: "e4" }); // white pawn
        game.validateAndMoveObject({ from: "e7", to: "e5" }); // black pawn
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "g1", to: "f3" }); // white knight
        game.validateAndMoveObject({ from: "b8", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f3", to: "e5" }); // white knight (capture black pawn)
        game.validateAndMoveObject({ from: "f8", to: "c5" }); // black bishop
        expect(game.isDraw).toBe(false);

        //////////////////////
        // START REPETITION //
        //////////////////////

        // note: first time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: second time position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        //////////////////////////
        // INTERRUPT REPETITION //
        //////////////////////////

        game.validateAndMoveObject({ from: "h1", to: "g1" }); // white rook
        game.validateAndMoveObject({ from: "c6", to: "a5" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: invalidates all previous position because rook is moved (castling rights changed)

        /////////////////////////
        // CONTINUE REPETITION //
        /////////////////////////

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        ////////////////////
        // UNDO INTERRUPT //
        ////////////////////

        game.validateAndMoveObject({ from: "g1", to: "h1" }); // white rook
        game.validateAndMoveObject({ from: "a5", to: "c6" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: first time new position occured

        /////////////////////////
        // CONTINUE REPETITION //
        /////////////////////////

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: second time new position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: third time new position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(false);

        // note: fourth time new position occured

        game.validateAndMoveObject({ from: "b1", to: "c3" }); // white knight
        game.validateAndMoveObject({ from: "g8", to: "f6" }); // black knight
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "c3", to: "b1" }); // white knight
        expect(game.isDraw).toBe(false);
        game.validateAndMoveObject({ from: "f6", to: "g8" }); // black knight
        expect(game.isDraw).toBe(true);

        // note: fifth time new position occured, draw
    });

    test("interrupted repetition by castling rights", () => {
        const game = new Chesster();

        ///////////
        // SETUP //
        ///////////

        game.validateAndMoveObject({ from: "e2", to: "e4" }); // white pawn
        game.validateAndMoveObject({ from: "h7", to: "h5" }); // black pawn

        // note: this position is never seen again before of castling rights change

        game.validateAndMoveObject({ from: "f1", to: "e2" }); // white bishop
        game.validateAndMoveObject({ from: "h8", to: "h7" }); // black rook

        // note: castling rights for black changed

        //////////////////////
        // START REPETITION //
        //////////////////////

        game.validateAndMoveObject({ from: "e2", to: "f1" }); // white bishop
        game.validateAndMoveObject({ from: "h7", to: "h8" }); // black rook
        expect(game.isDraw).toBe(false);

        // note: although this position has been seen before, castling rights differ

        game.validateAndMoveObject({ from: "f1", to: "e2" }); // white bishop
        game.validateAndMoveObject({ from: "h8", to: "h7" }); // black rook

        // note: second time position occured

        game.validateAndMoveObject({ from: "e2", to: "f1" }); // white bishop
        game.validateAndMoveObject({ from: "h7", to: "h8" }); // black rook
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f1", to: "e2" }); // white bishop
        game.validateAndMoveObject({ from: "h8", to: "h7" }); // black rook
        expect(game.isDraw).toBe(false);

        // note: third time position occured

        game.validateAndMoveObject({ from: "e2", to: "f1" }); // white bishop
        game.validateAndMoveObject({ from: "h7", to: "h8" }); // black rook
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f1", to: "e2" }); // white bishop
        game.validateAndMoveObject({ from: "h8", to: "h7" }); // black rook
        expect(game.isDraw).toBe(false);

        // note: fourth time position occured

        game.validateAndMoveObject({ from: "e2", to: "f1" }); // white bishop
        game.validateAndMoveObject({ from: "h7", to: "h8" }); // black rook
        expect(game.isDraw).toBe(false);

        game.validateAndMoveObject({ from: "f1", to: "e2" }); // white bishop
        game.validateAndMoveObject({ from: "h8", to: "h7" }); // black rook
        expect(game.isDraw).toBe(true);

        // note: fifth time position occured, draw
    });
});
