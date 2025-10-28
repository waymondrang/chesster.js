import {
    WHITE,
    BLACK,
    WHITE_ROOK,
    BLACK_PAWN,
    WHITE_PAWN,
    WHITE_QUEEN,
    WHITE_BISHOP,
    WHITE_KNIGHT,
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING,
    BOARD_SIZE,
    CAPTURE,
    CASTLE_KINGSIDE,
    CASTLE_QUEENSIDE,
    DOUBLE_PAWN_PUSH,
    EN_PASSANT_BLACK,
    EN_PASSANT_WHITE,
    MOVE,
    PROMOTION_BISHOP,
    PROMOTION_BISHOP_CAPTURE,
    PROMOTION_KNIGHT,
    PROMOTION_KNIGHT_CAPTURE,
    PROMOTION_QUEEN,
    PROMOTION_QUEEN_CAPTURE,
    PROMOTION_ROOK,
    PROMOTION_ROOK_CAPTURE,
    DEFAULT_BOARD,
} from "./const";
import type {
    GameStateType,
    PlayerType,
    TurnType,
    RecursivePartial,
} from "./types";
import {
    generateZobristKeys,
    getMoveType,
    numberToBinaryString,
    getPieceType,
    numberToPieceString,
} from "./util";

class Game implements GameStateType {
    board: number[];
    white: PlayerType;
    black: PlayerType;
    isStalemate: boolean;
    isDraw: boolean;
    turn: TurnType;
    turnHistory: number[];

    // Zobrist keys are used to hash the state of the game by generating
    // a random bitstring for combination of a piece and a position
    // along with additional bitstrings for castle rights, en passant, etc.

    // In this engine, they are generated only once, when the game object
    // is first created.

    private currentZobrist: bigint;
    private zobristHistory: bigint[];
    private zobristKeys: bigint[];

    // todo: implement zobrist keychain (hold keys in a structured data structure)

    // Zobrist hash indices for special game states
    // Piece positions use indices 0-767 (64 squares * 12 possible piece types)
    // The remaining indices are used for game state flags
    static readonly #PIECES_PER_SQUARE = 12;
    static readonly #TOTAL_PIECE_INDICES = BOARD_SIZE * Game.#PIECES_PER_SQUARE;
    static readonly #MIN_PIECE_VALUE = 2;

    #blackToMoveZobristIndex = Game.#TOTAL_PIECE_INDICES;
    #whiteCanCastleKingsideZobristIndex = Game.#TOTAL_PIECE_INDICES + 1;
    #whiteCanCastleQueensideZobristIndex = Game.#TOTAL_PIECE_INDICES + 2;
    #blackCanCastleKingsideZobristIndex = Game.#TOTAL_PIECE_INDICES + 3;
    #blackCanCastleQueensideZobristIndex = Game.#TOTAL_PIECE_INDICES + 4;
    #enPassantFileZobristIndex = Game.#TOTAL_PIECE_INDICES + 5;

    constructor(state?: RecursivePartial<GameStateType>) {
        const ZOBRIST_LENGTH =
            Game.#TOTAL_PIECE_INDICES + // 768: piece positions (64 squares * 12 piece types)
            1 + // 769: black to move
            4 + // 770-773: castling rights
            8; // 774-781: en passant files
        this.zobristKeys = generateZobristKeys(ZOBRIST_LENGTH);

        this.board = [];
        this.turn = WHITE;
        this.turnHistory = [];

        this.white = {
            isChecked: false,
            isCheckmated: false,
            canCastleKingside: true,
            canCastleQueenside: true,
        };

        this.black = {
            isChecked: false,
            isCheckmated: false,
            canCastleKingside: true,
            canCastleQueenside: true,
        };

        this.isStalemate = false;
        this.isDraw = false;
        this.currentZobrist = 0n;
        this.zobristHistory = [];

        this.init(state);
    }

    /**
     * Sets the game to default or specified state
     * Can be called during gameplay to start a new game
     */
    init(state?: RecursivePartial<GameStateType>): void {
        this.board = state?.board ?? [...DEFAULT_BOARD];
        this.turn = state?.turn ?? WHITE;
        this.turnHistory = state?.turnHistory ?? [];

        // note: player check states will be updated by game

        this.white = {
            isChecked: false,
            isCheckmated: false,
            canCastleKingside: state?.white?.canCastleKingside ?? true,
            canCastleQueenside: state?.white?.canCastleQueenside ?? true,
        };

        this.black = {
            isChecked: false,
            isCheckmated: false,
            canCastleKingside: state?.black?.canCastleKingside ?? true,
            canCastleQueenside: state?.black?.canCastleQueenside ?? true,
        };

        this.isStalemate = state?.isStalemate ?? false;
        this.isDraw = state?.isDraw ?? false;

        this.currentZobrist = this.calculateZobristHash();
        this.zobristHistory = [this.currentZobrist];

        this.#update();
    }

    /**
     * Calculates the Zobrist hash index for a piece at a specific position
     * @param position Board square index (0-63)
     * @param piece Piece value (4-bit encoded)
     * @returns Zobrist key array index
     */
    private getPieceZobristIndex(position: number, piece: number): number {
        return (
            position * Game.#PIECES_PER_SQUARE + (piece - Game.#MIN_PIECE_VALUE)
        );
    }

    /**
     * Calculates the zobrist hash for the current board state
     */
    private calculateZobristHash(): bigint {
        let hash = 0n;

        /////////////////
        // HASH PIECES //
        /////////////////

        for (let i = 0; i < BOARD_SIZE; i++) {
            const piece = this.board[i];
            if (piece)
                hash ^= this.zobristKeys[this.getPieceZobristIndex(i, piece)];
        }

        ///////////////
        // HASH TURN //
        ///////////////

        if (this.turn === BLACK)
            hash ^= this.zobristKeys[this.#blackToMoveZobristIndex];

        //////////////////////////
        // HASH CASTLING RIGHTS //
        //////////////////////////

        if (this.white.canCastleKingside)
            hash ^= this.zobristKeys[this.#whiteCanCastleKingsideZobristIndex];

        if (this.white.canCastleQueenside)
            hash ^= this.zobristKeys[this.#whiteCanCastleQueensideZobristIndex];

        if (this.black.canCastleKingside)
            hash ^= this.zobristKeys[this.#blackCanCastleKingsideZobristIndex];

        if (this.black.canCastleQueenside)
            hash ^= this.zobristKeys[this.#blackCanCastleQueensideZobristIndex];

        return hash;
    }

    /**
     * Takes back the last move
     */
    undo() {
        const prevMove = this.turnHistory.pop();

        if (!prevMove) return;

        ////////////////////////////
        //     update zobrist     //
        ////////////////////////////

        this.zobristHistory.pop();
        this.currentZobrist = this.zobristHistory.at(-1) ?? 0n;

        this.turn ^= 1;
        this.isStalemate = false; // update stalemate
        this.isDraw = false; // update draw
        this.black.isCheckmated = false;
        this.white.isCheckmated = false;

        this.black.canCastleQueenside = ((prevMove >>> 29) & 0b1) === 1;
        this.white.canCastleQueenside = ((prevMove >>> 28) & 0b1) === 1;
        this.black.canCastleKingside = ((prevMove >>> 27) & 0b1) === 1;
        this.white.canCastleKingside = ((prevMove >>> 26) & 0b1) === 1;
        this.black.isChecked = ((prevMove >>> 25) & 0b1) === 1;
        this.white.isChecked = ((prevMove >>> 24) & 0b1) === 1;

        switch (getMoveType(prevMove)) {
            case PROMOTION_QUEEN_CAPTURE:
                this.board[(prevMove >>> 8) & 0b111111] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                break;
            case PROMOTION_BISHOP_CAPTURE:
                this.board[(prevMove >>> 8) & 0b111111] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                break;
            case PROMOTION_ROOK_CAPTURE:
                this.board[(prevMove >>> 8) & 0b111111] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                break;
            case PROMOTION_KNIGHT_CAPTURE:
                this.board[(prevMove >>> 8) & 0b111111] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                break;
            case CAPTURE:
                this.board[(prevMove >>> 8) & 0b111111] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                break;
            case CASTLE_KINGSIDE:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[((prevMove >>> 14) & 0b111111) + 2] = 0;
                this.board[((prevMove >>> 14) & 0b111111) + 3] =
                    this.board[((prevMove >>> 14) & 0b111111) + 1]!;
                this.board[((prevMove >>> 14) & 0b111111) + 1] = 0;
                break;
            case CASTLE_QUEENSIDE:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[((prevMove >>> 14) & 0b111111) - 2] = 0;
                this.board[((prevMove >>> 14) & 0b111111) - 4] =
                    this.board[((prevMove >>> 14) & 0b111111) - 1]!;
                this.board[((prevMove >>> 14) & 0b111111) - 1] = 0;
                break;
            case EN_PASSANT_WHITE:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[((prevMove >>> 8) & 0b111111) + 8] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case EN_PASSANT_BLACK:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[((prevMove >>> 8) & 0b111111) - 8] =
                    (prevMove >>> 20) & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case PROMOTION_KNIGHT:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case PROMOTION_BISHOP:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case PROMOTION_ROOK:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case PROMOTION_QUEEN:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            case DOUBLE_PAWN_PUSH:
            case MOVE:
                this.board[(prevMove >>> 14) & 0b111111] = prevMove & 0b1111;
                this.board[(prevMove >>> 8) & 0b111111] = 0;
                break;
            default:
                throw new Error("invalid move type");
        }
    }

    /**
     * Performs a move
     * @param move The move to perform
     */
    move(move: number) {
        // 32 bit number
        let history =
            ((this.black.canCastleQueenside ? 1 : 0) << 29) |
            ((this.white.canCastleQueenside ? 1 : 0) << 28) |
            ((this.black.canCastleKingside ? 1 : 0) << 27) |
            ((this.white.canCastleKingside ? 1 : 0) << 26) |
            ((this.black.isChecked ? 1 : 0) << 25) |
            ((this.white.isChecked ? 1 : 0) << 24);

        switch (getMoveType(move)) {
            case CAPTURE:
                // Safe: (move >>> 8) & 0b111111 is always 0-63
                history |= this.board[(move >>> 8) & 0b111111]! << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (this.board[(move >>> 8) & 0b111111]! - 2) // remove captured piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 + ((move & 0b1111) - 2) // add moved piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = move & 0b1111;
                break;
            case CASTLE_KINGSIDE:
                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove king
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) + 2) * 12 +
                            ((move & 0b1111) - 2) // add king
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) + 3) * 12 +
                            ((WHITE_ROOK | (move & 0b1)) - 2) // remove rook
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) + 1) * 12 +
                            ((WHITE_ROOK | (move & 0b1)) - 2) // add rook
                    ];

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[((move >>> 14) & 0b111111) + 2] = move & 0b1111;
                this.board[((move >>> 14) & 0b111111) + 1] =
                    WHITE_ROOK | (move & 0b1);
                this.board[((move >>> 14) & 0b111111) + 3] = 0;
                break;
            case CASTLE_QUEENSIDE:
                /**
                 * these could be optimized, including the board[...] because the pieces are known
                 */

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove king
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) - 2) * 12 +
                            ((move & 0b1111) - 2) // add king
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) - 4) * 12 +
                            ((WHITE_ROOK | (move & 0b1)) - 2) // remove rook
                    ] ^
                    this.zobristKeys[
                        (((move >>> 14) & 0b111111) - 1) * 12 +
                            ((WHITE_ROOK | (move & 0b1)) - 2) // add rook
                    ];

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[((move >>> 14) & 0b111111) - 2] = move & 0b1111;
                this.board[((move >>> 14) & 0b111111) - 1] =
                    WHITE_ROOK | (move & 0b1);
                this.board[((move >>> 14) & 0b111111) - 4] = 0;
                break;
            case EN_PASSANT_WHITE:
                history |= BLACK_PAWN << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        (((move >>> 8) & 0b111111) + 8) * 12 +
                            (this.board[((move >>> 8) & 0b111111) + 8] - 2) // remove captured piece
                    ] ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 + (WHITE_PAWN - 2) // add moved piece (white pawn)
                    ] ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + (WHITE_PAWN - 2) // remove moved piece (white pawn)
                    ];

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = WHITE_PAWN;
                this.board[((move >>> 8) & 0b111111) + 8] = 0;
                break;
            case EN_PASSANT_BLACK:
                history |= WHITE_PAWN << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        (((move >>> 8) & 0b111111) - 8) * 12 +
                            (this.board[((move >>> 8) & 0b111111) - 8] - 2) // remove captured piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 + (BLACK_PAWN - 2) // add moved piece (black pawn)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + (BLACK_PAWN - 2) // remove moved piece (black pawn)
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = BLACK_PAWN;
                this.board[((move >>> 8) & 0b111111) - 8] = 0; // captured space
                break;
            case PROMOTION_QUEEN_CAPTURE:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (this.board[(move >>> 8) & 0b111111] - 2) // remove captured piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_QUEEN) - 2) // add moved piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_QUEEN;
                break;
            case PROMOTION_QUEEN:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_QUEEN) - 2) // add moved piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_QUEEN;
                break;
            case PROMOTION_ROOK_CAPTURE:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (this.board[(move >>> 8) & 0b111111] - 2) // remove captured piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_ROOK) - 2) // add moved piece (change)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_ROOK;
                break;
            case PROMOTION_ROOK:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_ROOK) - 2) // add moved piece (change)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_ROOK;
                break;
            case PROMOTION_BISHOP_CAPTURE:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (this.board[(move >>> 8) & 0b111111] - 2) // remove captured piece
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_BISHOP) - 2) // add moved piece (change)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_BISHOP;
                break;
            case PROMOTION_BISHOP:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_BISHOP) - 2) // add moved piece (change)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_BISHOP;
                break;
            case PROMOTION_KNIGHT_CAPTURE:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (this.board[(move >>> 8) & 0b111111] - 2) // remove captured piece
                    ] ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_KNIGHT) - 2) // add moved piece (change)
                    ] ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ];

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_KNIGHT;
                break;
            case PROMOTION_KNIGHT:
                history |= this.board[(move >>> 8) & 0b111111] << 20;

                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 +
                            (((move & 0b1) | WHITE_KNIGHT) - 2) // add moved piece (change)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2) // remove moved piece
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] =
                    (move & 0b1) | WHITE_KNIGHT;
                break;
            case DOUBLE_PAWN_PUSH:
                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 8) & 0b111) + this.#enPassantFileZobristIndex
                    ]!;
            case MOVE:
                this.currentZobrist ^=
                    this.zobristKeys[
                        ((move >>> 14) & 0b111111) * 12 + ((move & 0b1111) - 2)
                    ]! ^
                    this.zobristKeys[
                        ((move >>> 8) & 0b111111) * 12 + ((move & 0b1111) - 2) // re-move
                    ]!;

                this.board[(move >>> 14) & 0b111111] = 0;
                this.board[(move >>> 8) & 0b111111] = move & 0b1111;
                break;
            default:
                throw new Error(
                    "invalid move type: " + numberToBinaryString(move)
                );
        }

        // update zobrist hash if last move was double pawn push
        if (
            this.turnHistory.at(-1) &&
            ((this.turnHistory.at(-1)! >>> 4) & 0b1111) === DOUBLE_PAWN_PUSH
        )
            // return (this.history[this.history.length - 1] >>> 8) & 0b111;
            this.currentZobrist ^=
                this.zobristKeys[
                    ((this.turnHistory.at(-1)! >>> 8) & 0b111) +
                        this.#enPassantFileZobristIndex
                ]!;

        this.turnHistory.push(history | (move & 0b11111111111111111111)); // order independent
        this.turn ^= 1;
        this.#update(); // turn must be updated before calling update

        ////////////////////////////
        //     update zobrist     //
        ////////////////////////////

        this.currentZobrist ^= this.zobristKeys[this.#blackToMoveZobristIndex]!; // flip turn

        let positionSeenCount = 1; // current position has, obviously, been seen once
        for (let i = this.zobristHistory.length - 1; i >= 0; i--) {
            if (this.zobristHistory[i] === this.currentZobrist)
                positionSeenCount++;

            if (positionSeenCount === 5) {
                this.isDraw = true;
                break;
            }
        }

        this.zobristHistory.push(this.currentZobrist);
    }

    /**
     * Queries the legality of a move without updating the game state
     * @param move
     * @returns Whether the move is valid. A move is invalid when it will put the player in check.
     */
    queryMove(move: number): boolean {
        // 32 bit number
        let board = [...this.board];

        switch (getMoveType(move)) {
            case CAPTURE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = move & 0b1111;
                break;
            case CASTLE_KINGSIDE: // todo: add zobrist
                board[(move >>> 14) & 0b111111] = 0;
                board[((move >>> 14) & 0b111111) + 2] = move & 0b1111;
                board[((move >>> 14) & 0b111111) + 1] =
                    board[((move >>> 14) & 0b111111) + 3];
                board[((move >>> 14) & 0b111111) + 3] = 0;
                break;
            case CASTLE_QUEENSIDE: // todo: add zobrist
                board[(move >>> 14) & 0b111111] = 0;
                board[((move >>> 14) & 0b111111) - 2] = move & 0b1111;
                board[((move >>> 14) & 0b111111) - 1] =
                    board[((move >>> 14) & 0b111111) - 4];
                board[((move >>> 14) & 0b111111) - 4] = 0;
                break;
            case EN_PASSANT_WHITE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = move & 0b1111;
                board[((move >>> 8) & 0b111111) + 8] = 0;
                break;
            case EN_PASSANT_BLACK:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = move & 0b1111;
                board[((move >>> 8) & 0b111111) - 8] = 0; // captured space
                break;
            case PROMOTION_QUEEN_CAPTURE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_QUEEN;
                break;
            case PROMOTION_QUEEN:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_QUEEN;
                break;
            case PROMOTION_ROOK_CAPTURE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_ROOK;
                break;
            case PROMOTION_ROOK:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_ROOK;
                break;
            case PROMOTION_BISHOP_CAPTURE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_BISHOP;
                break;
            case PROMOTION_BISHOP:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_BISHOP;
                break;
            case PROMOTION_KNIGHT_CAPTURE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_KNIGHT;
                break;
            case PROMOTION_KNIGHT:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = (move & 0b1) | WHITE_KNIGHT;
                break;
            case DOUBLE_PAWN_PUSH:
            case MOVE:
                board[(move >>> 14) & 0b111111] = 0;
                board[(move >>> 8) & 0b111111] = move & 0b1111;
                break;
            default:
                throw new Error(
                    "invalid move type: " + numberToBinaryString(move)
                );
        }

        //////////////////////////
        //     update check     //
        //////////////////////////

        // check if past team is still in check
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (!board[i] || (board[i]! & 0b1) === this.turn) continue; // saved ~170ms

            if (
                this.canCapturePiece(i, board, 0b1100 | this.turn) // enemy piece can capture turn's king
            )
                return false;
        }

        return true;
    }

    /**
     * Move validator used for debugging
     * @param moveToValidate The move to validate
     * @returns The associated move as a number
     */
    validateAndMoveObject(moveToValidate: {
        from: string;
        to: string;
        promotion?: string;
    }): number {
        let promotion: number;

        switch (moveToValidate.promotion) {
            case "q":
                promotion = 0b00;
                break;
            case "r":
                promotion = 0b11;
                break;
            case "b":
                promotion = 0b10;
                break;
            case "n":
                promotion = 0b01;
                break;
        }

        const move = this.getAvailableMoves(
            (8 - Number.parseInt(moveToValidate.from[1]!)) * 8 +
                (moveToValidate.from.charCodeAt(0) - 97)
        ).find(
            (m) =>
                ((m >>> 8) & 0b111111) ===
                    (8 - Number.parseInt(moveToValidate.to[1]!)) * 8 +
                        (moveToValidate.to.charCodeAt(0) - 97) &&
                (moveToValidate.promotion
                    ? ((m >>> 6) & 0b11) === 0b10 || ((m >>> 6) & 0b11) === 0b11
                        ? ((m >>> 4) & 0b11) === promotion
                        : false
                    : true)
        );

        if (!move)
            throw new Error("invalid move: " + JSON.stringify(moveToValidate));

        this.move(move);

        return move;
    }

    /**
     * Updates game state variables
     * @returns The game state
     */
    #update() {
        //////////////////////////
        //     update check     //
        //////////////////////////

        let checked = 0b00; // left bit is currentChecked, right bit is pastChecked

        // check if past team is still in check
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (!this.board[i]) continue; // saved ~170ms

            if (
                !(checked & 0b01) &&
                (this.board[i] & 0b1) === this.turn &&
                this.canCapturePiece(i, this.board, 0b1100 | (1 ^ this.turn))
            ) {
                // 0b110 is king value
                checked |= 0b01; // set pastChecked
            } else if (
                !(checked & 0b10) &&
                (this.board[i] & 0b1) !== this.turn &&
                this.canCapturePiece(i, this.board, 0b1100 | this.turn)
            ) {
                // check if current turn is in check
                // 0b110 is king value
                checked |= 0b10; // set currentChecked
            }

            if (checked === 0b11) break;
        }

        this.white.isChecked =
            (this.turn === WHITE ? (checked & 0b10) >>> 1 : checked & 0b01) ===
            1;
        this.black.isChecked =
            (this.turn === WHITE ? checked & 0b01 : (checked & 0b10) >>> 1) ===
            1;

        /////////////////////////////
        //     update castling     //
        /////////////////////////////

        if (
            this.white.canCastleKingside &&
            (this.board[60] !== 0b1100 || this.board[63] !== 0b1000)
        ) {
            this.white.canCastleKingside = false;
            this.currentZobrist ^=
                this.zobristKeys[this.#whiteCanCastleKingsideZobristIndex];
        }

        if (
            this.white.canCastleQueenside &&
            (this.board[60] !== 0b1100 || this.board[56] !== 0b1000)
        ) {
            this.white.canCastleQueenside = false;
            this.currentZobrist ^=
                this.zobristKeys[this.#whiteCanCastleQueensideZobristIndex];
        }

        if (
            this.black.canCastleKingside &&
            (this.board[4] !== 0b1101 || this.board[7] !== 0b1001)
        ) {
            this.black.canCastleKingside = false;
            this.currentZobrist ^=
                this.zobristKeys[this.#blackCanCastleKingsideZobristIndex];
        }

        if (
            this.black.canCastleQueenside &&
            (this.board[4] !== 0b1101 || this.board[0] !== 0b1001)
        ) {
            this.black.canCastleQueenside = false;
            this.currentZobrist ^=
                this.zobristKeys[this.#blackCanCastleQueensideZobristIndex];
        }

        /*
         * the below code relies on the fact that both teams cannot be checked at
         * the same time. additionally, we only need to check if the current team is
         * in checkmate. we do not need to check the previous team as they could not
         * make any moves that would result in check.
         */

        this.white.isCheckmated = this.white.isChecked;
        this.black.isCheckmated = this.black.isChecked;
        let sm = true;

        for (let i = 0; i < BOARD_SIZE; i++) {
            if (!this.board[i] || (this.board[i] & 0b1) !== this.turn) continue;

            if (this.getAvailableMoves(i).length > 0) {
                if (this.turn === WHITE) this.white.isCheckmated = false;
                if (this.turn === BLACK) this.black.isCheckmated = false;
                sm = false;
                break;
            }
        }

        this.isStalemate =
            !this.white.isCheckmated && !this.black.isCheckmated && sm;
    }

    /**
     * Checks if the game is over.
     * @returns Whether or not the game is over
     */
    isGameOver(): boolean {
        return (
            this.white.isCheckmated ||
            this.black.isCheckmated ||
            this.isStalemate ||
            this.isDraw
        );
    }

    /**
     * Returns all available moves for the current turn
     * @returns An array of moves
     */
    moves(): number[] {
        if (this.isGameOver()) return [];

        let moves = [];

        for (let i = 0; i < BOARD_SIZE; i++) {
            if (!this.board[i] || (this.board[i] & 0b1) !== this.turn) continue;

            moves.push(...this.getAvailableMoves(i));
        }

        return moves;
    }

    /**
     * Returns the current game state
     * @returns The game state
     */
    getState(): GameStateType {
        return {
            board: [...this.board],
            turn: this.turn,
            turnHistory: [...this.turnHistory],
            white: { ...this.white },
            black: { ...this.black },
            isStalemate: this.isStalemate,
            isDraw: this.isDraw,
        };
    }

    /**
     * Returns all potential moves for the location
     * @param location The location of the piece
     * @returns An array of moves
     */
    getAllMoves(location: number): number[] {
        switch (getPieceType(this.board[location])) {
            case PAWN:
                return this.getPawnMoves(location);
            case KNIGHT:
                return this.getKnightMoves(location);
            case BISHOP:
                return this.getBishopMoves(location);
            case ROOK:
                return this.getRookMoves(location);
            case QUEEN:
                return this.getQueenMoves(location);
            case KING:
                return this.getKingMoves(location);
            default:
                return [];
        }
    }

    /**
     * Returns whether location can capture specified piece
     * @param location The location of the piece
     * @param board The board to check
     * @param target The piece to capture (4 bit number)
     * @returns An array of captures
     */
    canCapturePiece(
        location: number,
        board: number[],
        target: number
    ): boolean {
        switch (getPieceType(board[location])) {
            case 0b001:
                return this.canPawnCapture(location, board, target);
            case 0b010:
                return this.canKnightCapture(location, board, target);
            case 0b011:
                return this.canBishopCapture(location, board, target);
            case 0b100:
                return this.canRookCapture(location, board, target);
            case 0b101:
                return this.canQueenCapture(location, board, target);
            case 0b110:
                return this.canKingCapture(location, board, target);
            default:
                throw new Error(
                    "invalid piece: " + numberToPieceString(board[location])
                );
        }
    }

    /**
     * Returns available moves for the given location
     * @returns An array of moves
     */
    getAvailableMoves(location: number): number[] {
        const moves = this.getAllMoves(location);

        const finalMoves = [];
        // const team = this.board[location] & 0b1;

        for (let i = 0; i < moves.length; i++) {
            /////////////////////////
            // CHECK MOVE LEGALITY //
            /////////////////////////

            if (
                !this.queryMove(moves[i]) ||
                (getMoveType(moves[i]) === CASTLE_KINGSIDE &&
                    !this.queryMove(
                        (moves[i] & 0b11111100000000001111) |
                            (((moves[i] >>> 14) + 1) << 8) |
                            (MOVE << 4)
                    )) ||
                (getMoveType(moves[i]) === CASTLE_QUEENSIDE &&
                    !this.queryMove(
                        (moves[i] & 0b11111100000000001111) |
                            (((moves[i] >>> 14) - 1) << 8) |
                            (MOVE << 4)
                    ))
            )
                continue;

            finalMoves.push(moves[i]);
        }

        return finalMoves;
    }

    getKingMoves(location: number): number[] {
        const moves: number[] = [];

        // bottom row (if not bottom row)
        if ((location & 0b111000) !== 0b111000) {
            // if location contains enemy piece
            if (!this.board[location + 8]) {
                moves.push(
                    (location << 14) |
                        ((location + 8) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + 8] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + 8) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
            }
            // else location contains friendly piece, do not push any move
        }

        // top row
        if (location & 0b111000) {
            // if location contains enemy piece
            if (!this.board[location - 8]) {
                moves.push(
                    (location << 14) |
                        ((location - 8) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - 8] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - 8) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
            }
            // else location contains friendly piece, do not push any move
        }

        // right-most column
        if ((location & 0b111) !== 0b111) {
            if (!this.board[location + 1]) {
                moves.push(
                    (location << 14) |
                        ((location + 1) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + 1] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + 1) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
            }

            // bottom row
            if ((location & 0b111000) !== 0b111000) {
                // alternatively could do < 56
                if (!this.board[location + 9]) {
                    moves.push(
                        (location << 14) |
                            ((location + 9) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 9] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 9) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            // top row
            if (location & 0b111000) {
                // moves.push(-7);
                if (!this.board[location - 7]) {
                    moves.push(
                        (location << 14) |
                            ((location - 7) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 7] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 7) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }
        }

        if (location & 0b111) {
            // left-most column
            // moves.push(-1);
            if (!this.board[location - 1]) {
                moves.push(
                    (location << 14) |
                        ((location - 1) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - 1] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - 1) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
            }

            // top row
            if (location & 0b111000) {
                // moves.push(-9);
                if (!this.board[location - 9]) {
                    moves.push(
                        (location << 14) |
                            ((location - 9) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 9] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 9) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            // bottom row
            if ((location & 0b111000) !== 0b111000) {
                // moves.push(7);
                if (!this.board[location + 7]) {
                    moves.push(
                        (location << 14) |
                            ((location + 7) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 7] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 7) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }
        }

        // castling
        if (!(this.board[location] & 0b1) && !this.white.isChecked) {
            // white king-side
            if (
                this.white.canCastleKingside &&
                !this.board[location + 1] &&
                !this.board[location + 2]
            )
                moves.push(
                    (location << 14) |
                        ((location + 2) << 8) |
                        (CASTLE_KINGSIDE << 4) |
                        this.board[location]
                    // (location << 14) | (CASTLE_KINGSIDE << 4) | piece
                );

            // white queen-side
            if (
                this.white.canCastleQueenside &&
                !this.board[location - 1] &&
                !this.board[location - 2] &&
                !this.board[location - 3]
            )
                moves.push(
                    (location << 14) |
                        ((location - 2) << 8) |
                        (CASTLE_QUEENSIDE << 4) |
                        this.board[location]
                    // (location << 14) | (CASTLE_QUEENSIDE << 4) | piece
                );
        }

        if (
            (this.board[location] & 0b1) === 1 &&
            this.black.isChecked === false
        ) {
            // black king-side
            if (
                this.black.canCastleKingside &&
                !this.board[location + 1] &&
                !this.board[location + 2]
            )
                moves.push(
                    (location << 14) |
                        ((location + 2) << 8) |
                        (CASTLE_KINGSIDE << 4) |
                        this.board[location]
                    // (location << 14) | (CASTLE_KINGSIDE << 4) | piece
                );

            // black queen-side
            if (
                this.black.canCastleQueenside &&
                !this.board[location - 1] &&
                !this.board[location - 2] &&
                !this.board[location - 3]
            )
                moves.push(
                    (location << 14) |
                        ((location - 2) << 8) |
                        (CASTLE_QUEENSIDE << 4) |
                        this.board[location]
                    // (location << 14) | (CASTLE_QUEENSIDE << 4) | piece
                );
        }

        return moves;
    }

    canKingCapture(location: number, board: number[], target: number): boolean {
        // bottom row (if not bottom row)
        if (
            (location & 0b111000) !== 0b111000 &&
            board[location + 8] === target
        ) {
            return true;
        }

        // top row
        if (location & 0b111000 && board[location - 8] === target) {
            return true;
        }

        // right-most column
        if ((location & 0b111) !== 0b111) {
            if (board[location + 1] === target) {
                return true;
            }

            // bottom row
            if (
                (location & 0b111000) !== 0b111000 &&
                board[location + 9] === target
            ) {
                return true;
            }

            // top row
            if (location & 0b111000 && board[location - 7] === target) {
                return true;
            }
        }

        if (location & 0b111) {
            // left-most column
            if (board[location - 1] === target) {
                return true;
            }

            // top row
            if (location & 0b111000 && board[location - 9] === target) {
                return true;
            }

            // bottom row
            if (
                (location & 0b111000) !== 0b111000 &&
                board[location + 7] === target
            ) {
                return true;
            }
        }

        return false;
    }

    getKnightMoves(location: number): number[] {
        const moves: number[] = [];

        if (location < 48) {
            if ((location & 0b111) !== 0b111)
                if (!this.board[location + 17]) {
                    // can do 2 down 1 right
                    moves.push(
                        (location << 14) |
                            ((location + 17) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 17] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 17) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }

            if (location & 0b111)
                if (!this.board[location + 15]) {
                    moves.push(
                        (location << 14) |
                            ((location + 15) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 15] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 15) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
        }

        if (location > 15) {
            if ((location & 0b111) !== 0b111)
                if (!this.board[location - 15]) {
                    moves.push(
                        (location << 14) |
                            ((location - 15) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 15] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 15) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }

            if (location & 0b111)
                if (!this.board[location - 17]) {
                    moves.push(
                        (location << 14) |
                            ((location - 17) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 17] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 17) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
        }

        if ((location & 0b111) > 1) {
            if (location < 56) {
                if (!this.board[location + 6]) {
                    moves.push(
                        (location << 14) |
                            ((location + 6) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 6] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 6) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            if (location > 7) {
                if (!this.board[location - 10]) {
                    moves.push(
                        (location << 14) |
                            ((location - 10) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 10] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 10) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }
        }

        if ((location & 0b111) < 6) {
            if (location < 56) {
                if (!this.board[location + 10]) {
                    moves.push(
                        (location << 14) |
                            ((location + 10) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location + 10] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location + 10) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            if (location > 7) {
                if (!this.board[location - 6]) {
                    moves.push(
                        (location << 14) |
                            ((location - 6) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );
                } else if (
                    (this.board[location - 6] & 0b1) !==
                    (this.board[location] & 0b1)
                ) {
                    moves.push(
                        (location << 14) |
                            ((location - 6) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }
        }

        return moves;
    }

    canKnightCapture(
        location: number,
        board: number[],
        target: number
    ): boolean {
        if (location < 48) {
            if (
                (location & 0b111) !== 0b111 &&
                board[location + 17] === target
            ) {
                return true;
            }

            if (location & 0b111 && board[location + 15] === target) {
                return true;
            }
        }

        if (location > 15) {
            if (
                (location & 0b111) !== 0b111 &&
                board[location - 15] === target
            ) {
                return true;
            }

            if (location & 0b111 && board[location - 17] === target) {
                return true;
            }
        }

        if ((location & 0b111) > 1) {
            if (location < 56 && board[location + 6] === target) {
                return true;
            }

            if (location > 7 && board[location - 10] === target) {
                return true;
            }
        }

        if ((location & 0b111) < 6) {
            if (location < 56 && board[location + 10] === target) {
                return true;
            }

            if (location > 7 && board[location - 6] === target) {
                return true;
            }
        }

        return false;
    }

    getBishopMoves(location: number): number[] {
        const moves: number[] = [];

        // down right
        for (
            let i = 1;
            ((location + 9 * i) & 0b111) > 0 && location + 9 * i < 64;
            i++
        ) {
            if (!this.board[location + 9 * i]) {
                moves.push(
                    (location << 14) |
                        ((location + 9 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + 9 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + 9 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        // up right
        for (
            let i = 1;
            (location - 7 * i) & 0b111 && location - 7 * i > 0;
            i++
        ) {
            if (!this.board[location - 7 * i]) {
                moves.push(
                    (location << 14) |
                        ((location - 7 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - 7 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - 7 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        // down left
        for (
            let i = 1;
            ((location + 7 * i) & 0b111) < 7 && location + 7 * i < 64;
            i++
        ) {
            if (!this.board[location + 7 * i]) {
                moves.push(
                    (location << 14) |
                        ((location + 7 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + 7 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + 7 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                // friendly piece
                break;
            }
        }

        // up left
        for (
            let i = 1;
            ((location - 9 * i) & 0b111) < 7 && location - 9 * i >= 0;
            i++
        ) {
            if (!this.board[location - 9 * i]) {
                moves.push(
                    (location << 14) |
                        ((location - 9 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - 9 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - 9 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        return moves;
    }

    canBishopCapture(
        location: number,
        board: number[],
        target: number
    ): boolean {
        // down right
        for (
            let i = 1;
            ((location + 9 * i) & 0b111) > 0 && location + 9 * i < 64;
            i++
        ) {
            if (!board[location + 9 * i]) continue;

            if (board[location + 9 * i] === target) {
                return true;
            }

            break;
        }

        // up right
        for (
            let i = 1;
            (location - 7 * i) & 0b111 && location - 7 * i > 0;
            i++
        ) {
            if (!board[location - 7 * i]) continue;

            if (board[location - 7 * i] === target) {
                return true;
            }

            break;
        }

        // down left
        for (
            let i = 1;
            ((location + 7 * i) & 0b111) < 7 && location + 7 * i < 64;
            i++
        ) {
            if (!board[location + 7 * i]) continue;

            if (board[location + 7 * i] === target) {
                return true;
            }

            break;
        }

        // up left
        for (
            let i = 1;
            ((location - 9 * i) & 0b111) < 7 && location - 9 * i >= 0;
            i++
        ) {
            if (!board[location - 9 * i]) continue;

            if (board[location - 9 * i] === target) {
                return true;
            }

            break;
        }

        return false;
    }

    getRookMoves(location: number): number[] {
        const moves: number[] = [];

        // right
        for (let i = 1; i < 8 - (location & 0b111); i++) {
            if (!this.board[location + i]) {
                moves.push(
                    (location << 14) |
                        ((location + i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        // left
        for (let i = 1; i < (location & 0b111) + 1; i++) {
            if (!this.board[location - i]) {
                moves.push(
                    (location << 14) |
                        ((location - i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        // down
        for (let i = 1; location + 8 * i < 64; i++) {
            if (!this.board[location + 8 * i]) {
                moves.push(
                    (location << 14) |
                        ((location + 8 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location + 8 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location + 8 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        // up
        for (let i = 1; location - 8 * i >= 0; i++) {
            if (!this.board[location - 8 * i]) {
                moves.push(
                    (location << 14) |
                        ((location - 8 * i) << 8) |
                        (MOVE << 4) |
                        this.board[location]
                );
            } else if (
                (this.board[location - 8 * i] & 0b1) !==
                (this.board[location] & 0b1)
            ) {
                moves.push(
                    (location << 14) |
                        ((location - 8 * i) << 8) |
                        (CAPTURE << 4) |
                        this.board[location]
                );
                break;
            } else {
                break;
            }
        }

        return moves;
    }

    canRookCapture(location: number, board: number[], target: number): boolean {
        // right
        for (let i = 1; i < 8 - (location & 0b111); i++) {
            if (!board[location + i]) continue;

            if (board[location + i] === target) {
                return true;
            }

            break;
        }

        // left
        for (let i = 1; i < (location & 0b111) + 1; i++) {
            if (!board[location - i]) continue;

            if (board[location - i] === target) {
                return true;
            }

            break;
        }

        // down
        for (let i = 1; location + 8 * i < 64; i++) {
            if (!board[location + 8 * i]) continue;

            if (board[location + 8 * i] === target) {
                return true;
            }

            break;
        }

        // up
        for (let i = 1; location - 8 * i >= 0; i++) {
            if (!board[location - 8 * i]) continue;

            if (board[location - 8 * i] === target) {
                return true;
            }

            break;
        }

        return false;
    }

    getQueenMoves(location: number): number[] {
        return [
            ...this.getBishopMoves(location),
            ...this.getRookMoves(location),
        ];
    }

    canQueenCapture(
        location: number,
        board: number[],
        target: number
    ): boolean {
        return (
            this.canBishopCapture(location, board, target) ||
            this.canRookCapture(location, board, target)
        );
    }

    getPawnMoves(location: number): number[] {
        const moves: number[] = [];

        // white piece
        if (this.board[location] & 0b1) {
            // black piece
            if (!this.board[location + 8]) {
                // promotion
                if (location >>> 3 === 6) {
                    moves.push(
                        (location << 14) |
                            ((location + 8) << 8) |
                            (PROMOTION_QUEEN << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 8) << 8) |
                            (PROMOTION_ROOK << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 8) << 8) |
                            (PROMOTION_BISHOP << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 8) << 8) |
                            (PROMOTION_KNIGHT << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location + 8) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );

                    if (location >>> 3 === 1 && !this.board[location + 16]) {
                        // double move
                        moves.push(
                            (location << 14) |
                                ((location + 16) << 8) |
                                (DOUBLE_PAWN_PUSH << 4) |
                                this.board[location]
                        );
                    }
                }
            }

            // upper left capture
            if (
                (location & 0b111) !== 7 && // or < 7
                this.board[location + 9] &&
                !(this.board[location + 9] & 0b1)
            ) {
                if ((location + 9) >>> 3 === 7) {
                    moves.push(
                        (location << 14) |
                            ((location + 9) << 8) |
                            (PROMOTION_QUEEN_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 9) << 8) |
                            (PROMOTION_ROOK_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 9) << 8) |
                            (PROMOTION_BISHOP_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 9) << 8) |
                            (PROMOTION_KNIGHT_CAPTURE << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location + 9) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            // upper right capture
            if (
                location & 0b111 &&
                this.board[location + 7] &&
                !(this.board[location + 7] & 0b1)
            )
                if ((location + 7) >>> 3 === 7) {
                    moves.push(
                        (location << 14) |
                            ((location + 7) << 8) |
                            (PROMOTION_QUEEN_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 7) << 8) |
                            (PROMOTION_ROOK_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 7) << 8) |
                            (PROMOTION_BISHOP_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location + 7) << 8) |
                            (PROMOTION_KNIGHT_CAPTURE << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location + 7) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }

            // en passant
            if (
                (((location >>> 3) & 0b111) === 0b100 &&
                    this.turnHistory.at(-1) &&
                    (this.turnHistory.at(-1)! >>> 4) & 0b1111) ===
                    DOUBLE_PAWN_PUSH &&
                (((this.turnHistory.at(-1)! >>> 8) & 0b111111) - location ===
                    1 ||
                    ((this.turnHistory.at(-1)! >>> 8) & 0b111111) - location ===
                        -1)
            ) {
                moves.push(
                    (location << 14) |
                        ((((this.turnHistory.at(-1)! >>> 8) & 0b111111) + 8) <<
                            8) |
                        (EN_PASSANT_BLACK << 4) |
                        this.board[location]
                );
            }
        } else {
            // promotion

            // up
            if (!this.board[location - 8]) {
                if (!((location - 8) >>> 3)) {
                    // this piece can only do promotion
                    moves.push(
                        (location << 14) |
                            ((location - 8) << 8) |
                            (PROMOTION_QUEEN << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 8) << 8) |
                            (PROMOTION_ROOK << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 8) << 8) |
                            (PROMOTION_BISHOP << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 8) << 8) |
                            (PROMOTION_KNIGHT << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location - 8) << 8) |
                            (MOVE << 4) |
                            this.board[location]
                    );

                    if (location >>> 3 === 6 && !this.board[location - 16]) {
                        // double move
                        moves.push(
                            (location << 14) |
                                ((location - 16) << 8) |
                                (DOUBLE_PAWN_PUSH << 4) |
                                this.board[location]
                        );
                    }
                }
            }

            // upper left capture
            if (location & 0b111 && (this.board[location - 9] & 0b1) === 1) {
                if (!((location - 9) >>> 3)) {
                    moves.push(
                        (location << 14) |
                            ((location - 9) << 8) |
                            (PROMOTION_QUEEN_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 9) << 8) |
                            (PROMOTION_ROOK_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 9) << 8) |
                            (PROMOTION_BISHOP_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 9) << 8) |
                            (PROMOTION_KNIGHT_CAPTURE << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location - 9) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            // upper right capture
            if (
                (location & 0b111) !== 7 &&
                (this.board[location - 7] & 0b1) === 1
            ) {
                if (!((location - 7) >>> 3)) {
                    moves.push(
                        (location << 14) |
                            ((location - 7) << 8) |
                            (PROMOTION_QUEEN_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 7) << 8) |
                            (PROMOTION_ROOK_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 7) << 8) |
                            (PROMOTION_BISHOP_CAPTURE << 4) |
                            this.board[location],
                        (location << 14) |
                            ((location - 7) << 8) |
                            (PROMOTION_KNIGHT_CAPTURE << 4) |
                            this.board[location]
                    );
                } else {
                    moves.push(
                        (location << 14) |
                            ((location - 7) << 8) |
                            (CAPTURE << 4) |
                            this.board[location]
                    );
                }
            }

            // en passant
            if (
                ((location >>> 3) & 0b111) === 0b011 &&
                this.turnHistory.at(-1) &&
                ((this.turnHistory.at(-1)! >>> 4) & 0b1111) ===
                    DOUBLE_PAWN_PUSH &&
                (((this.turnHistory.at(-1)! >>> 8) & 0b111111) - location ===
                    1 ||
                    ((this.turnHistory.at(-1)! >>> 8) & 0b111111) - location ===
                        -1)
            ) {
                moves.push(
                    (location << 14) |
                        ((((this.turnHistory.at(-1)! >>> 8) & 0b111111) - 8) <<
                            8) |
                        (EN_PASSANT_WHITE << 4) |
                        this.board[location]
                );
            }
        }

        return moves;
    }

    canPawnCapture(location: number, board: number[], target: number): boolean {
        // white piece
        if (board[location] & 0b1) {
            // black piece

            // upper left capture
            if (
                (location & 0b111) !== 7 && // or < 7
                board[location + 9] === target
            ) {
                return true;
            }

            // upper right capture
            if (location & 0b111 && board[location + 7] === target) {
                return true;
            }
        } else {
            // promotion

            // upper left capture
            if (location & 0b111 && board[location - 9] === target) {
                return true;
            }

            // upper right capture
            if ((location & 0b111) !== 7 && board[location - 7] === target) {
                return true;
            }
        }

        return false;
    }
}

export { Game as ChessterGame };
