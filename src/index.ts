/**
 * chesster.js, a high-performance chess engine written in typescript
 * @packageDocumentation
 */

import {
    MOVE,
    CASTLE_KINGSIDE,
    CASTLE_QUEENSIDE,
    DOUBLE_PAWN_PUSH,
    CAPTURE,
    EN_PASSANT_WHITE,
    EN_PASSANT_BLACK,
    PROMOTION_KNIGHT,
    PROMOTION_BISHOP,
    PROMOTION_ROOK,
    PROMOTION_QUEEN,
    PROMOTION_KNIGHT_CAPTURE,
    PROMOTION_BISHOP_CAPTURE,
    PROMOTION_ROOK_CAPTURE,
    PROMOTION_QUEEN_CAPTURE,
    EMPTY_CELL,
    PAWN,
    WHITE_PAWN,
    BLACK_PAWN,
    KNIGHT,
    WHITE_KNIGHT,
    BLACK_KNIGHT,
    BISHOP,
    WHITE_BISHOP,
    BLACK_BISHOP,
    ROOK,
    WHITE_ROOK,
    BLACK_ROOK,
    QUEEN,
    WHITE_QUEEN,
    BLACK_QUEEN,
    KING,
    WHITE_KING,
    BLACK_KING,
} from "./const";

////////////
// ENGINE //
////////////

export { ChessterGame as Chesster } from "./game";

///////////
// TYPES //
///////////

export type { GameStateType as ChessterGameState } from "./types";
export type { PlayerType as Player } from "./types";

///////////////
// CONSTANTS //
///////////////

export {
    ////////////
    // PLAYER //
    ////////////
    WHITE,
    BLACK,

    //////////////////////
    // BOARD DIMENSIONS //
    //////////////////////
    BOARD_SIZE,
    BOARD_LENGTH,
    BOARD_WIDTH,

    ///////////////////
    // DEFAULT BOARD //
    ///////////////////
    DEFAULT_BOARD,
} from "./const";

////////////
// PIECES //
////////////

export const PIECES = {
    EMPTY_CELL,
    PAWN,
    WHITE_PAWN,
    BLACK_PAWN,
    KNIGHT,
    WHITE_KNIGHT,
    BLACK_KNIGHT,
    BISHOP,
    WHITE_BISHOP,
    BLACK_BISHOP,
    ROOK,
    WHITE_ROOK,
    BLACK_ROOK,
    QUEEN,
    WHITE_QUEEN,
    BLACK_QUEEN,
    KING,
    WHITE_KING,
    BLACK_KING,
} as const;

////////////////
// MOVE TYPES //
////////////////

export const MOVE_TYPES = {
    MOVE,
    CASTLE_KINGSIDE,
    CASTLE_QUEENSIDE,
    DOUBLE_PAWN_PUSH,
    CAPTURE,
    EN_PASSANT_WHITE,
    EN_PASSANT_BLACK,
    PROMOTION_KNIGHT,
    PROMOTION_BISHOP,
    PROMOTION_ROOK,
    PROMOTION_QUEEN,
    PROMOTION_KNIGHT_CAPTURE,
    PROMOTION_BISHOP_CAPTURE,
    PROMOTION_ROOK_CAPTURE,
    PROMOTION_QUEEN_CAPTURE,
} as const;

///////////////
// UTILITIES //
///////////////

export { fenToBoard, fenToGameState } from "./util";
