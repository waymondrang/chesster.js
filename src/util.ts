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
    WHITE,
    BLACK,
} from "./const";
import type { GameStateType, RecursivePartial, TurnType } from "./types";

// piece to string lookup table
const PIECE_TO_STRING: Record<number, string> = {
    [BLACK_PAWN]: "♟︎",
    [WHITE_PAWN]: "♙",
    [BLACK_KNIGHT]: "♞",
    [WHITE_KNIGHT]: "♘",
    [BLACK_ROOK]: "♜",
    [WHITE_ROOK]: "♖",
    [BLACK_BISHOP]: "♝",
    [WHITE_BISHOP]: "♗",
    [BLACK_QUEEN]: "♛",
    [WHITE_QUEEN]: "♕",
    [BLACK_KING]: "♚",
    [WHITE_KING]: "♔",
};

function numberToPieceString(x: number): string {
    return PIECE_TO_STRING[x] ?? "";
}

function numberToBinaryString(x: number): string {
    return (x >> 0).toString(2);
}

function lcg(seed: bigint): bigint {
    return (2862933555777941757n * seed + 3037000493n) % 18446744073709551616n;
}

function generateZobristKeys(length: number): bigint[] {
    const keys: bigint[] = [8746989176631517180n]; // initial zobrist key

    for (let i = 1; i < length; i++) {
        const prevKey = keys[i - 1];
        keys.push(lcg(prevKey));
    }

    return keys;
}

/**
 * converts a fen board string to a board array
 *
 * @param fen - fen board notation (just the piece placement section)
 * @param flip - if true, flips the color of pieces
 * @returns board array
 */
function fenToBoard(fen: string, flip = false): number[] {
    const FEN_TO_PIECE_NORMAL: Record<string, number> = {
        p: BLACK_PAWN,
        r: BLACK_ROOK,
        n: BLACK_KNIGHT,
        b: BLACK_BISHOP,
        q: BLACK_QUEEN,
        k: BLACK_KING,
        P: WHITE_PAWN,
        R: WHITE_ROOK,
        N: WHITE_KNIGHT,
        B: WHITE_BISHOP,
        Q: WHITE_QUEEN,
        K: WHITE_KING,
    };

    const FEN_TO_PIECE_FLIPPED: Record<string, number> = {
        P: BLACK_PAWN,
        R: BLACK_ROOK,
        N: BLACK_KNIGHT,
        B: BLACK_BISHOP,
        Q: BLACK_QUEEN,
        K: BLACK_KING,
        p: WHITE_PAWN,
        r: WHITE_ROOK,
        n: WHITE_KNIGHT,
        b: WHITE_BISHOP,
        q: WHITE_QUEEN,
        k: WHITE_KING,
    };

    const pieceMap = flip ? FEN_TO_PIECE_FLIPPED : FEN_TO_PIECE_NORMAL;

    const ranks = fen.split("/");
    const board: number[] = [];

    for (const rank of ranks) {
        for (const char of rank) {
            const emptySquares = parseInt(char, 10);

            if (!isNaN(emptySquares)) {
                board.push(...Array(emptySquares).fill(0));
            } else {
                const piece = pieceMap[char];

                if (piece === undefined) {
                    throw new Error(
                        `invalid fen character: '${char}' (${fen})`
                    );
                }

                board.push(piece);
            }
        }

        // validate rank has exactly 8 squares
        if (board.length % 8 !== 0) {
            throw new Error(
                `invalid fen string: rank doesn't have 8 squares (${fen})`
            );
        }
    }

    if (board.length !== 64) {
        throw new Error(
            `invalid fen string: expected 64 squares, got ${board.length} (${fen})`
        );
    }

    return board;
}

/**
 * converts a full fen string to a chesster game state
 *
 * @param fen - fen notation string
 * @param flip - if true, flips the color of pieces
 * @returns partial game object that can be used to initiate a game
 */
function fenToGameState(
    fen: string,
    flip = false
): RecursivePartial<GameStateType> {
    const FEN_TO_PLAYER: Record<string, TurnType> = {
        w: WHITE,
        b: BLACK,
    };

    const fenParts = fen.trim().split(" ");

    if (fenParts.length < 3) {
        throw new Error(
            `invalid fen string: expected at least 3 parts, got ${fenParts.length} (${fen})`
        );
    }

    const [boardPart, turnPart, castlingPart] = fenParts;

    if (boardPart.split("/").length !== 8) {
        throw new Error(`invalid fen string: expected 8 ranks (${fen})`);
    }

    if (turnPart !== "w" && turnPart !== "b") {
        throw new Error(
            `invalid fen string: turn must be 'w' or 'b', got '${turnPart}' (${fen})`
        );
    }

    return {
        board: fenToBoard(boardPart, flip),
        turn: FEN_TO_PLAYER[turnPart],
        white: {
            canCastleKingside: castlingPart.includes("K"),
            canCastleQueenside: castlingPart.includes("Q"),
        },
        black: {
            canCastleKingside: castlingPart.includes("k"),
            canCastleQueenside: castlingPart.includes("q"),
        },
    };
}

/////////////////////////////
// INLINE HELPER FUNCTIONS //
/////////////////////////////

const getPieceType = (piece: number): number => (piece >>> 1) & 0b111;
const getPieceColor = (piece: number): number => piece & 0b1;
const getMoveType = (move: number): number => (move >>> 4) & 0b1111;

export {
    lcg,
    generateZobristKeys,
    numberToBinaryString,
    numberToPieceString,
    fenToBoard,
    fenToGameState,
    getPieceType,
    getPieceColor,
    getMoveType,
};
