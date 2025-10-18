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

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    // Prevent human from playing during O's (computer) turn
    if (!xIsNext) return;

    // Ignore clicks if game over or cell already filled
    if (calculateWinner(squares) || squares[i]) return;

    const next = squares.slice();
    next[i] = "X"; // human is always X; O is automated
    onPlay(next);
  }

  const winner = calculateWinner(squares);
  const status = winner
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

  return (
    <>
      <div className="status">{status}</div>
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

/* ===== AI Helpers ===== */

function findBestMove(squares) {
  // a) If O can win now, play that move
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const t = squares.slice();
      t[i] = "O";
      if (calculateWinner(t) === "O") return i;
    }
  }

  // b) If X could win next, block it
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const t = squares.slice();
      t[i] = "X";
      if (calculateWinner(t) === "X") return i;
    }
  }

  // c) Otherwise: center, corners, edges
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const i of moveOrder) {
    if (!squares[i]) return i;
  }

  return null; // board full
}

/* ===== Game (Default Export) ===== */

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);

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
  }

  // Auto-move for O after X plays
  useEffect(() => {
    if (xIsNext) return; // only act on O's turn

    const winner = calculateWinner(currentSquares);
    if (winner || !currentSquares.includes(null)) return; // stop if over/full

    // small delay feels nicer; remove if you want instant
    const t = setTimeout(() => {
      const idx = findBestMove(currentSquares);
      if (idx != null) {
        const next = currentSquares.slice();
        next[idx] = "O";
        handlePlay(next);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [currentSquares, xIsNext]); // run when board or turn changes

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

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
        <button type="button" onClick={handleReset} style={{ marginTop: 8 }}>
          Reset
        </button>
      </div>
    </div>
  );
}

/* ===== Winner Detection (loop version is fine; regex version also OK) ===== */

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

