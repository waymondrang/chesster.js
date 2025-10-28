# Bit Representation Reference

This document provides a comprehensive reference for the bit-level data structures used in chesster.js.

## Piece bit representation

| Piece      | Bit pattern |
| ---------- | ----------- |
| empty cell | 000         |
| pawn       | 001         |
| knight     | 010         |
| bishop     | 011         |
| rook       | 100         |
| queen      | 101         |
| king       | 110         |
| (unused)   | 111         |

| team  | bit value |
| ----- | --------- |
| white | 0         |
| black | 1         |

\*_4 bits total; team being least significant bit_

## Move bit representation

| Data      | # of bits | Start |
| --------- | --------- | ----- |
| move from | 6         | 14    |
| move to   | 6         | 8     |
| move type | 4         | 4     |
| piece     | 4         | 0     |

\*_20 bits total_

## Move type bit representation

| move type                  | bit pattern |
| -------------------------- | ----------- |
| move                       | 0000        |
| castle (king side)         | 0001        |
| castle (queen side)        | 0010        |
| double pawn push           | 0011        |
| capture                    | 0100        |
| en passant (white)         | 0101        |
| en passant (black)         | 0110        |
| (unused)                   | 0111        |
| promotion (knight)         | 1000        |
| promotion (bishop)         | 1001        |
| promotion (rook)           | 1010        |
| promotion (queen)          | 1011        |
| promotion capture (knight) | 1100        |
| promotion capture (bishop) | 1101        |
| promotion capture (rook)   | 1110        |
| promotion capture (queen)  | 1111        |

\*_The last two bits in the promotion can be used to determine the promotion piece by adding 2_

## Turn history bit representation

| Data                        | # of bits | Start |
| --------------------------- | --------- | ----- |
| black can queen side castle | 1         | 29    |
| white can queen side castle | 1         | 28    |
| black can king side castle  | 1         | 27    |
| white can king side castle  | 1         | 26    |
| black castled               | 1         | 25    |
| white castled               | 1         | 24    |
| captured piece              | 4         | 20    |
| move from                   | 6         | 14    |
| move to                     | 6         | 8     |
| move type                   | 4         | 4     |
| original piece              | 4         | 0     |

## Default starting position bit representation

| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7 ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| 1001 | 0101 | 0111 | 1011 | 1101 | 0111 | 0101 | 1001  |
| 1001 | 1001 | 1001 | 1001 | 1001 | 1001 | 1001 | 1001  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000 | 0000  |
| 1000 | 1000 | 1000 | 1000 | 1000 | 1000 | 1000 | 1000  |
| 1000 | 0100 | 0110 | 1010 | 1100 | 0110 | 0100 | 1000  |

## Board reference

The board contains 60 x 4 bit pieces. Pieces are indexed from top to bottom, left to right.

|     | 0      | 1      | 2      | 3      | 4      | 5      | 6      | 7 ...  |
| --- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| 0   | 000000 | 000001 | 000010 | 000011 | 000100 | 000101 | 000110 | 000111 |
| 8   | 001000 | 001001 | 001010 | 001011 | 001100 | 001101 | 001110 | 001111 |
| 16  | 010000 | 010001 | 010010 | 010011 | 010100 | 010101 | 010110 | 010111 |
| 24  | 011000 | 011001 | 011010 | 011011 | 011100 | 011101 | 011110 | 011111 |
| 32  | 100000 | 100001 | 100010 | 100011 | 100100 | 100101 | 100110 | 100111 |
| 40  | 101000 | 101001 | 101010 | 101011 | 101100 | 101101 | 101110 | 101111 |
| 48  | 110000 | 110001 | 110010 | 110011 | 110100 | 110101 | 110110 | 110111 |
| 56  | 111000 | 111001 | 111010 | 111011 | 111100 | 111101 | 111110 | 111111 |

## Zobrist Hashing

| Index     | Significance             |
| --------- | ------------------------ |
| 0 - 767   | 12 pieces for each space |
| 768       | black to move            |
| 769       | white king side castle   |
| 770       | white queen side castle  |
| 771       | black king side castle   |
| 772       | black queen side castle  |
| 773 - 780 | en passant file (1-8)    |
