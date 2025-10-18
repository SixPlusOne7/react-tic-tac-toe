import { useState, useEffect } from "react";
import "./styles.css";

/* ===== UI Components ===== */

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, humanPlays }) {
  function handleClick(i) {
    // Block clicks if it's not the human's turn
    const humansTurn =
      (xIsNext && humanPlays === "X") || (!xIsNext && humanPlays === "O");
    if (!humansTurn) return;

    // Ignore if game over or cell filled
    if (calculateWinner(squares) || squares[i]) return;

    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    onPlay(next);
  }

  const winner = calculateWinner(squares);
  const status = winner
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

  const controlNote = `You are playing: ${humanPlays}`;

  return (
    <>
      <div className="status">{status}</div>
      <div className="status sub">{controlNote}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

/* ===== Helpers (Winner + AI) ===== */

function calculateWinner(sq) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
  }
  return null;
}

function other(player) {
  return player === "X" ? "O" : "X";
}

/** Generalized best-move:
 *  1) Win now for `player`
 *  2) Block opponent
 *  3) Priority: center, corners, edges
 */
function findBestMove(squares, player) {
  const foe = other(player);

  // Win now
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const t = squares.slice();
      t[i] = player;
      if (calculateWinner(t) === player) return i;
    }
  }
  // Block foe
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const t = squares.slice();
      t[i] = foe;
      if (calculateWinner(t) === foe) return i;
    }
  }
  // Heuristic order
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const i of moveOrder) {
    if (!squares[i]) return i;
  }
  return null;
}

/* ===== Game (Default Export) ===== */

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [humanPlays, setHumanPlays] = useState("X"); // ⬅️ NEW: which side human controls ("X" or "O")

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setHumanPlays("X"); // default: human starts as X again
  }

  // Computer auto-move when it's the computer's turn
  const computersTurn =
    (xIsNext && humanPlays === "O") || (!xIsNext && humanPlays === "X");

  // One function to perform the computer move for the CURRENT player
  function makeComputerMoveForCurrent() {
    const winner = calculateWinner(currentSquares);
    if (winner || !currentSquares.includes(null)) return;

    const player = xIsNext ? "X" : "O";
    const idx = findBestMove(currentSquares, player);
    if (idx != null) {
      const next = currentSquares.slice();
      next[idx] = player;
      handlePlay(next);
    }
  }

  useEffect(() => {
    if (!computersTurn) return;
    // Small delay so it feels natural; remove if you want instant
    const t = setTimeout(() => {
      makeComputerMoveForCurrent();
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSquares, xIsNext, computersTurn]);

  // Challenge 4 button:
  // - makes the best move for the CURRENT player (by AI)
  // - then flips who the human controls
  function handleSwitch() {
    const winner = calculateWinner(currentSquares);
    if (!winner && currentSquares.includes(null)) {
      makeComputerMoveForCurrent();
    }
    setHumanPlays((p) => other(p));
  }

  const moves = history.map((_, move) => {
    const here = move === currentMove;
    const label = move ? `Go to move #${move}` : "Go to game start";
    return (
      <li key={move}>
        {here ? (
          <span>You are at move #{move}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{label}</button>
        )}
      </li>
    );
  });

  const nextPlayer = xIsNext ? "X" : "O";

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          humanPlays={humanPlays}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
          <button type="button" onClick={handleSwitch}>
            Switch to Player {nextPlayer}
          </button>
        </div>
      </div>
    </div>
  );
}
