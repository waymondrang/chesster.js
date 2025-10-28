/////////////////////
// PIECE CONSTANTS //
/////////////////////

export const EMPTY_CELL = 0b0000;
export const PAWN = 0b001;
export const WHITE_PAWN = 0b0010;
export const BLACK_PAWN = 0b0011;
export const KNIGHT = 0b010;
export const WHITE_KNIGHT = 0b0100;
export const BLACK_KNIGHT = 0b0101;
export const BISHOP = 0b011;
export const WHITE_BISHOP = 0b0110;
export const BLACK_BISHOP = 0b0111;
export const ROOK = 0b100;
export const WHITE_ROOK = 0b1000;
export const BLACK_ROOK = 0b1001;
export const QUEEN = 0b101;
export const WHITE_QUEEN = 0b1010;
export const BLACK_QUEEN = 0b1011;
export const KING = 0b110;
export const WHITE_KING = 0b1100;
export const BLACK_KING = 0b1101;

/////////////////////
// BOARD CONSTANTS //
/////////////////////

export const BOARD_SIZE = 64;
export const BOARD_LENGTH = 8;
export const BOARD_WIDTH = 8;

//////////////////////
// PLAYER CONSTANTS //
//////////////////////

export const WHITE = 0;
export const BLACK = 1;

////////////////////
// MOVE CONSTANTS //
////////////////////

export const MOVE = 0b0000;
export const CASTLE_KINGSIDE = 0b0001;
export const CASTLE_QUEENSIDE = 0b0010;
export const DOUBLE_PAWN_PUSH = 0b0011;
export const CAPTURE = 0b0100;
export const EN_PASSANT_WHITE = 0b0101;
export const EN_PASSANT_BLACK = 0b0110;
export const PROMOTION_KNIGHT = 0b1000;
export const PROMOTION_BISHOP = 0b1001;
export const PROMOTION_ROOK = 0b1010;
export const PROMOTION_QUEEN = 0b1011;
export const PROMOTION_KNIGHT_CAPTURE = 0b1100;
export const PROMOTION_BISHOP_CAPTURE = 0b1101;
export const PROMOTION_ROOK_CAPTURE = 0b1110;
export const PROMOTION_QUEEN_CAPTURE = 0b1111;

///////////////////////////////
// DEFAULT STARTING POSITION //
///////////////////////////////

// prettier-ignore
export const DEFAULT_BOARD = [
    BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK,
    BLACK_PAWN, BLACK_PAWN,   BLACK_PAWN,   BLACK_PAWN,  BLACK_PAWN, BLACK_PAWN,   BLACK_PAWN,   BLACK_PAWN,
    EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,  EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,
    EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,  EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,
    EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,  EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,
    EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,  EMPTY_CELL, EMPTY_CELL,   EMPTY_CELL,   EMPTY_CELL,
    WHITE_PAWN, WHITE_PAWN,   WHITE_PAWN,   WHITE_PAWN,  WHITE_PAWN, WHITE_PAWN,   WHITE_PAWN,   WHITE_PAWN,
    WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK,
];
