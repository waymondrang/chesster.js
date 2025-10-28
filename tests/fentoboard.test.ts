import { describe, expect, test } from "@jest/globals";
import { fenToBoard } from "../src/util";
import {
    BLACK_PAWN,
    WHITE_PAWN,
    BLACK_KNIGHT,
    WHITE_KNIGHT,
    BLACK_ROOK,
    WHITE_ROOK,
    BLACK_BISHOP,
    WHITE_BISHOP,
    BLACK_QUEEN,
    WHITE_QUEEN,
    BLACK_KING,
    WHITE_KING,
    EMPTY_CELL,
} from "../src/const";

describe("basic fentoboard() testing", () => {
    test("converts standard starting position", () => {
        const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
        const board = fenToBoard(fen);

        expect(board.length).toBe(64);

        // check ranks!
        expect(board[0]).toBe(BLACK_ROOK);
        expect(board[1]).toBe(BLACK_KNIGHT);
        expect(board[2]).toBe(BLACK_BISHOP);
        expect(board[3]).toBe(BLACK_QUEEN);
        expect(board[4]).toBe(BLACK_KING);
        expect(board[5]).toBe(BLACK_BISHOP);
        expect(board[6]).toBe(BLACK_KNIGHT);
        expect(board[7]).toBe(BLACK_ROOK);

        for (let i = 8; i < 16; i++) {
            expect(board[i]).toBe(BLACK_PAWN);
        }

        for (let i = 16; i < 48; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        for (let i = 48; i < 56; i++) {
            expect(board[i]).toBe(WHITE_PAWN);
        }

        expect(board[56]).toBe(WHITE_ROOK);
        expect(board[57]).toBe(WHITE_KNIGHT);
        expect(board[58]).toBe(WHITE_BISHOP);
        expect(board[59]).toBe(WHITE_QUEEN);
        expect(board[60]).toBe(WHITE_KING);
        expect(board[61]).toBe(WHITE_BISHOP);
        expect(board[62]).toBe(WHITE_KNIGHT);
        expect(board[63]).toBe(WHITE_ROOK);
    });

    test("converts empty board", () => {
        const fen = "8/8/8/8/8/8/8/8";
        const board = fenToBoard(fen);

        expect(board.length).toBe(64);
        expect(board.every((square) => square === EMPTY_CELL)).toBe(true);
    });

    test("convert random fen string (4n3/1Pk1N3/8/1P5p/1r4pr/1BK1P1p1/q4P2/2b5)", () => {
        const fen = "4n3/1Pk1N3/8/1P5p/1r4pr/1BK1P1p1/q4P2/2b5";
        const board = fenToBoard(fen);

        expect(board.length).toBe(64);

        expect(board[0]).toBe(EMPTY_CELL);
        expect(board[1]).toBe(EMPTY_CELL);
        expect(board[2]).toBe(EMPTY_CELL);
        expect(board[3]).toBe(EMPTY_CELL);
        expect(board[4]).toBe(BLACK_KNIGHT);
        expect(board[5]).toBe(EMPTY_CELL);
        expect(board[6]).toBe(EMPTY_CELL);
        expect(board[7]).toBe(EMPTY_CELL);

        expect(board[8]).toBe(EMPTY_CELL);
        expect(board[9]).toBe(WHITE_PAWN);
        expect(board[10]).toBe(BLACK_KING);
        expect(board[11]).toBe(EMPTY_CELL);
        expect(board[12]).toBe(WHITE_KNIGHT);
        expect(board[13]).toBe(EMPTY_CELL);
        expect(board[14]).toBe(EMPTY_CELL);
        expect(board[15]).toBe(EMPTY_CELL);

        for (let i = 16; i < 24; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        expect(board[24]).toBe(EMPTY_CELL);
        expect(board[25]).toBe(WHITE_PAWN);
        expect(board[26]).toBe(EMPTY_CELL);
        expect(board[27]).toBe(EMPTY_CELL);
        expect(board[28]).toBe(EMPTY_CELL);
        expect(board[29]).toBe(EMPTY_CELL);
        expect(board[30]).toBe(EMPTY_CELL);
        expect(board[31]).toBe(BLACK_PAWN);

        expect(board[32]).toBe(EMPTY_CELL);
        expect(board[33]).toBe(BLACK_ROOK);
        expect(board[34]).toBe(EMPTY_CELL);
        expect(board[35]).toBe(EMPTY_CELL);
        expect(board[36]).toBe(EMPTY_CELL);
        expect(board[37]).toBe(EMPTY_CELL);
        expect(board[38]).toBe(BLACK_PAWN);
        expect(board[39]).toBe(BLACK_ROOK);

        expect(board[40]).toBe(EMPTY_CELL);
        expect(board[41]).toBe(WHITE_BISHOP);
        expect(board[42]).toBe(WHITE_KING);
        expect(board[43]).toBe(EMPTY_CELL);
        expect(board[44]).toBe(WHITE_PAWN);
        expect(board[45]).toBe(EMPTY_CELL);
        expect(board[46]).toBe(BLACK_PAWN);
        expect(board[47]).toBe(EMPTY_CELL);

        expect(board[48]).toBe(BLACK_QUEEN);
        expect(board[49]).toBe(EMPTY_CELL);
        expect(board[50]).toBe(EMPTY_CELL);
        expect(board[51]).toBe(EMPTY_CELL);
        expect(board[52]).toBe(EMPTY_CELL);
        expect(board[53]).toBe(WHITE_PAWN);
        expect(board[54]).toBe(EMPTY_CELL);
        expect(board[55]).toBe(EMPTY_CELL);

        expect(board[56]).toBe(EMPTY_CELL);
        expect(board[57]).toBe(EMPTY_CELL);
        expect(board[58]).toBe(BLACK_BISHOP);
        expect(board[59]).toBe(EMPTY_CELL);
        expect(board[60]).toBe(EMPTY_CELL);
        expect(board[61]).toBe(EMPTY_CELL);
        expect(board[62]).toBe(EMPTY_CELL);
        expect(board[63]).toBe(EMPTY_CELL);
    });
});

describe("testing fentoboard() pieces", () => {
    test("converts all black piece types", () => {
        const fen = "rnbqkbnr/8/8/8/8/8/8/8";
        const board = fenToBoard(fen);

        expect(board[0]).toBe(BLACK_ROOK);
        expect(board[1]).toBe(BLACK_KNIGHT);
        expect(board[2]).toBe(BLACK_BISHOP);
        expect(board[3]).toBe(BLACK_QUEEN);
        expect(board[4]).toBe(BLACK_KING);
        expect(board[5]).toBe(BLACK_BISHOP);
        expect(board[6]).toBe(BLACK_KNIGHT);
        expect(board[7]).toBe(BLACK_ROOK);

        for (let i = 8; i < 64; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }
    });

    test("converts all white piece types", () => {
        const fen = "8/8/8/8/8/8/8/RNBQKBNR";
        const board = fenToBoard(fen);

        for (let i = 0; i < 56; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        expect(board[56]).toBe(WHITE_ROOK);
        expect(board[57]).toBe(WHITE_KNIGHT);
        expect(board[58]).toBe(WHITE_BISHOP);
        expect(board[59]).toBe(WHITE_QUEEN);
        expect(board[60]).toBe(WHITE_KING);
        expect(board[61]).toBe(WHITE_BISHOP);
        expect(board[62]).toBe(WHITE_KNIGHT);
        expect(board[63]).toBe(WHITE_ROOK);
    });

    test("converts full board of (illegal) pawns", () => {
        const fen =
            "pppppppp/pppppppp/pppppppp/pppppppp/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP";
        const board = fenToBoard(fen);

        for (let i = 8; i < 32; i++) {
            expect(board[i]).toBe(BLACK_PAWN);
        }

        for (let i = 32; i < 64; i++) {
            expect(board[i]).toBe(WHITE_PAWN);
        }
    });
});

describe("testing fentoboard() flip", () => {
    test("flips default starting position", () => {
        const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
        const board = fenToBoard(fen, true);

        expect(board.length).toBe(64);

        expect(board[0]).toBe(WHITE_ROOK);
        expect(board[1]).toBe(WHITE_KNIGHT);
        expect(board[2]).toBe(WHITE_BISHOP);
        expect(board[3]).toBe(WHITE_QUEEN);
        expect(board[4]).toBe(WHITE_KING);
        expect(board[5]).toBe(WHITE_BISHOP);
        expect(board[6]).toBe(WHITE_KNIGHT);
        expect(board[7]).toBe(WHITE_ROOK);

        for (let i = 8; i < 16; i++) {
            expect(board[i]).toBe(WHITE_PAWN);
        }

        for (let i = 16; i < 48; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        for (let i = 48; i < 56; i++) {
            expect(board[i]).toBe(BLACK_PAWN);
        }

        expect(board[56]).toBe(BLACK_ROOK);
        expect(board[57]).toBe(BLACK_KNIGHT);
        expect(board[58]).toBe(BLACK_BISHOP);
        expect(board[59]).toBe(BLACK_QUEEN);
        expect(board[60]).toBe(BLACK_KING);
        expect(board[61]).toBe(BLACK_BISHOP);
        expect(board[62]).toBe(BLACK_KNIGHT);
        expect(board[63]).toBe(BLACK_ROOK);
    });

    test("flips random random fen string (8/q2pK1b1/1p6/N7/1P5k/B1nQ2p1/3R1P2/1br5)", () => {
        const fen = "8/q2pK1b1/1p6/N7/1P5k/B1nQ2p1/3R1P2/1br5";
        const board = fenToBoard(fen, true);

        expect(board.length).toBe(64);

        for (let i = 0; i < 8; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        expect(board[8]).toBe(WHITE_QUEEN);
        expect(board[9]).toBe(EMPTY_CELL);
        expect(board[10]).toBe(EMPTY_CELL);
        expect(board[11]).toBe(WHITE_PAWN);
        expect(board[12]).toBe(BLACK_KING);
        expect(board[13]).toBe(EMPTY_CELL);
        expect(board[14]).toBe(WHITE_BISHOP);
        expect(board[15]).toBe(EMPTY_CELL);

        expect(board[16]).toBe(EMPTY_CELL);
        expect(board[17]).toBe(WHITE_PAWN);
        for (let i = 18; i < 24; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        expect(board[24]).toBe(BLACK_KNIGHT);
        for (let i = 25; i < 32; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }

        expect(board[32]).toBe(EMPTY_CELL);
        expect(board[33]).toBe(BLACK_PAWN);
        for (let i = 34; i < 39; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }
        expect(board[39]).toBe(WHITE_KING);

        expect(board[40]).toBe(BLACK_BISHOP);
        expect(board[41]).toBe(EMPTY_CELL);
        expect(board[42]).toBe(WHITE_KNIGHT);
        expect(board[43]).toBe(BLACK_QUEEN);
        expect(board[44]).toBe(EMPTY_CELL);
        expect(board[45]).toBe(EMPTY_CELL);
        expect(board[46]).toBe(WHITE_PAWN);
        expect(board[47]).toBe(EMPTY_CELL);

        expect(board[48]).toBe(EMPTY_CELL);
        expect(board[49]).toBe(EMPTY_CELL);
        expect(board[50]).toBe(EMPTY_CELL);
        expect(board[51]).toBe(BLACK_ROOK);
        expect(board[52]).toBe(EMPTY_CELL);
        expect(board[53]).toBe(BLACK_PAWN);
        expect(board[54]).toBe(EMPTY_CELL);
        expect(board[55]).toBe(EMPTY_CELL);

        expect(board[56]).toBe(EMPTY_CELL);
        expect(board[57]).toBe(WHITE_BISHOP);
        expect(board[58]).toBe(WHITE_ROOK);
        for (let i = 59; i < 64; i++) {
            expect(board[i]).toBe(EMPTY_CELL);
        }
    });
});

describe("testing fentoboard() error handling", () => {
    test("throws error for invalid piece character", () => {
        const invalidFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPX/RNBQKBNR";

        expect(() => fenToBoard(invalidFen)).toThrow(
            "invalid fen character: 'X'"
        );
    });

    test("throws error for rank with too many empty cells", () => {
        const invalidFen = "8/8/8/8/8/8/8/9";

        expect(() => fenToBoard(invalidFen)).toThrow(
            "rank doesn't have 8 squares"
        );
    });

    test("throws error for rank with too many pieces", () => {
        const invalidFen = "rnbqkbnr/ppppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

        expect(() => fenToBoard(invalidFen)).toThrow(
            "rank doesn't have 8 squares"
        );
    });

    test("throws error for rank with too few empty squares", () => {
        const invalidFen = "rnbqkbnr/pppppppp/7/8/8/8/PPPPPPPP/RNBQKBNR";

        expect(() => fenToBoard(invalidFen)).toThrow(
            "rank doesn't have 8 squares"
        );
    });

    test("throws error for rank with too few pieces", () => {
        const invalidFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPP/RNBQKBNR";

        expect(() => fenToBoard(invalidFen)).toThrow(
            "rank doesn't have 8 squares"
        );
    });

    test("throws error for wrong number of ranks", () => {
        const invalidFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP";

        expect(() => fenToBoard(invalidFen)).toThrow("expected 64 squares");
    });

    test("throws error for empty string", () => {
        expect(() => fenToBoard("")).toThrow();
    });
});
