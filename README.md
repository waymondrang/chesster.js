# chesster.js

![NPM Version](https://img.shields.io/npm/v/chesster.js)

A TypeScript chess library focused on performance and accuracy.

## Features

- Fast move generation using bit-manipulation
- Full chess rules (castling, en passant, promotion)
- Fivefold repetition stalemate draw
- Move history and undo
- FEN string import
- Check, checkmate, and stalemate detection

## Installation

```bash
npm install chesster.js
```

## Usage

```typescript
import { Chesster } from "chesster.js";

// Create a new game
const game = new Chesster();

// Get all legal moves
const moves = game.moves();

// Make a move
game.move(moves[0]);

// Undo a move
game.undo();

// Check if game is over
if (game.isGameOver()) {
    console.log("gg");
}
```

## Planned features

- FEN string export
- _MORE PERFORMANCE!_

## License

ISC
