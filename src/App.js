import { useState, useEffect } from "react";
import "./styles.css";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    // Human plays X only; block clicks when it's O's turn
    if (!xIsNext) return;

    // Ignore if game over or cell filled
    if (calculateWinner(squares) || squares[i]) return;

    const next = squares.slice();
    next[i] = "X";
    onPlay(next);
  }

  const winner = calculateWinner(squares);
  const isDraw = !winner && !squares.includes(null);
  const status = winner
    ? "Winner: " + winner
    : isDraw
    ? "Draw!"
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

  // Auto-move for O using minimax whenever it's O's turn
  useEffect(() => {
    if (xIsNext) return; // only act on O's turn
    const winner = calculateWinner(currentSquares);
    if (winner || !currentSquares.includes(null)) return; // stop if over/full

    // Small delay feels natural; remove if you want instant
    const t = setTimeout(() => {
      const idx = findBestMove(currentSquares, "O");
      if (idx != null) {
        const next = currentSquares.slice();
        next[idx] = "O";
        handlePlay(next);
      }
    }, 150);

    return () => clearTimeout(t);
  }, [currentSquares, xIsNext]); // re-run when board or turn changes

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
      </div>
    </div>
  );
}

function calculateWinner(sq) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b,c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
  }
  return null;
}

/* ======== Challenge 5: Minimax AI ======== */

function minimax(board, depth, isMaximizing) {
  const winner = calculateWinner(board);
  if (winner === "X") return 10 - depth;
  if (winner === "O") return depth - 10;
  if (!board.includes(null)) return 0; // draw

  const player = isMaximizing ? "X" : "O";
  let best = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] == null) {
      const next = board.slice();
      next[i] = player;
      const score = minimax(next, depth + 1, !isMaximizing);
      if (isMaximizing) best = Math.max(best, score);
      else best = Math.min(best, score);
    }
  }
  return best;
}

function findBestMove(board, player) {
  const isMaximizing = player === "X";
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] == null) {
      const next = board.slice();
      next[i] = player;
      const score = minimax(next, 0, !isMaximizing);
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}
