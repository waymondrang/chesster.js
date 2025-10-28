import type { WHITE, BLACK } from "./const";

// https://stackoverflow.com/a/51365037
type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object | undefined
          ? RecursivePartial<T[P]>
          : T[P];
};

interface PlayerType {
    isChecked: boolean;
    isCheckmated: boolean;
    canCastleKingside: boolean;
    canCastleQueenside: boolean;
}

type TurnType = typeof WHITE | typeof BLACK;

/**
 * Represents the complete game state.
 * This interface should match the public state properties of ChessterGame class.
 */
interface GameStateType {
    board: number[];
    white: PlayerType;
    black: PlayerType;
    isStalemate: boolean;
    isDraw: boolean;
    turn: TurnType;
    turnHistory: number[];
}

export type { RecursivePartial, PlayerType, TurnType, GameStateType };
