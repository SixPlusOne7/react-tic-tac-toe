import { useEffect, useMemo, useState } from "react";
import "./styles.css";

/* ========== UI ========== */

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ n, xIsNext, squares, onPlay, humanPlays }) {
  function handleClick(i) {
    // Only allow the human's turn
    const humansTurn =
      (xIsNext && humanPlays === "X") || (!xIsNext && humanPlays === "O");
    if (!humansTurn) return;

    if (calculateWinnerN(squares, n) || squares[i]) return;

    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    onPlay(next);
  }

  const winner = calculateWinnerN(squares, n);
  const full = !squares.includes(null);
  const isDraw = !winner && full;

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? "Draw!"
    : `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <>
      <div className="status">{status}</div>
      <div className="status sub">Board size: {n}×{n} • You play: {humanPlays}</div>
      {/* Render n rows */}
      {Array.from({ length: n }).map((_, r) => (
        <div className="board-row" key={r}>
          {Array.from({ length: n }).map((__, c) => {
            const i = r * n + c;
            return (
              <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

/* ========== Game (Default Export) ========== */

export default function Game() {
  const [n, setN] = useState(3); // board size
  const [history, setHistory] = useState([Array(3 * 3).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [humanPlays, setHumanPlays] = useState("X"); // "X" or "O"

  // Whenever n changes, reset a fresh game of size n×n
  useEffect(() => {
    setHistory([Array(n * n).fill(null)]);
    setCurrentMove(0);
    setHumanPlays("X");
  }, [n]);

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
    setHistory([Array(n * n).fill(null)]);
    setCurrentMove(0);
    setHumanPlays("X");
  }

  // --- AUTO MOVE (Computer) ---
  const computersTurn =
    (xIsNext && humanPlays === "O") || (!xIsNext && humanPlays === "X");

  // Decide which player the computer should play on this turn
  const currentPlayer = xIsNext ? "X" : "O";

  useEffect(() => {
    if (!computersTurn) return;
    const winner = calculateWinnerN(currentSquares, n);
    if (winner || !currentSquares.includes(null)) return;

    const t = setTimeout(() => {
      let idx;
      if (n === 3) {
        // Perfect play for 3x3 using minimax
        idx = findBestMoveMinimax(currentSquares, currentPlayer);
      } else {
        // Lightweight heuristic for larger boards
        idx = findBestMoveHeuristic(currentSquares, n, currentPlayer);
      }
      if (idx != null) {
        const next = currentSquares.slice();
        next[idx] = currentPlayer;
        handlePlay(next);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [currentSquares, computersTurn, currentPlayer, n]); // no disable needed if plugin installed

  const moves = useMemo(
    () =>
      history.map((_, move) => {
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
      }),
    [history, currentMove]
  );

  const nextPlayer = xIsNext ? "X" : "O";
  const gameOver =
    calculateWinnerN(currentSquares, n) || !currentSquares.includes(null);

  return (
    <div className="game">
      <div className="game-board">
        <Board
          n={n}
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          humanPlays={humanPlays}
        />
      </div>

      <div className="game-info">
        {/* Board size control */}
        <div style={{ marginBottom: 8 }}>
          <label>
            Board Size:&nbsp;
            <input
              type="number"
              min={3}
              max={10}
              value={n}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (Number.isInteger(val) && val >= 3 && val <= 10) setN(val);
              }}
              style={{ width: 64 }}
            />
          </label>
        </div>

        <ol>{moves}</ol>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={handleReset}>Reset</button>
          <button
            onClick={() => setHumanPlays((p) => (p === "X" ? "O" : "X"))}
            disabled={gameOver}
          >
            Switch to Player {nextPlayer}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Winner detection for n×n (k = n) ========== */

function calculateWinnerN(sq, n) {
  // Rows
  for (let r = 0; r < n; r++) {
    const a = r * n;
    const first = sq[a];
    if (!first) continue;
    let ok = true;
    for (let c = 1; c < n; c++) {
      if (sq[a + c] !== first) {
        ok = false;
        break;
      }
    }
    if (ok) return first;
  }

  // Cols
  for (let c = 0; c < n; c++) {
    const first = sq[c];
    if (!first) continue;
    let ok = true;
    for (let r = 1; r < n; r++) {
      if (sq[r * n + c] !== first) {
        ok = false;
        break;
      }
    }
    if (ok) return first;
  }

  // Main diagonal
  {
    const first = sq[0];
    if (first) {
      let ok = true;
      for (let k = 1; k < n; k++) {
        if (sq[k * n + k] !== first) {
          ok = false;
          break;
        }
      }
      if (ok) return first;
    }
  }

  // Anti-diagonal
  {
    const first = sq[n - 1];
    if (first) {
      let ok = true;
      for (let k = 1; k < n; k++) {
        if (sq[k * n + (n - 1 - k)] !== first) {
          ok = false;
          break;
        }
      }
      if (ok) return first;
    }
  }

  return null;
}

/* ========== Minimax (3×3 only) ========== */

function minimax(board, n, depth, isMaximizing) {
  const winner = calculateWinnerN(board, n);
  if (winner === "X") return 10 - depth;
  if (winner === "O") return depth - 10;
  if (!board.includes(null)) return 0;

  const player = isMaximizing ? "X" : "O";
  let best = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < n * n; i++) {
    if (board[i] == null) {
      const next = board.slice();
      next[i] = player;
      const score = minimax(next, n, depth + 1, !isMaximizing);
      best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

function findBestMoveMinimax(board, player) {
  const n = Math.sqrt(board.length) | 0; // n×n
  if (n !== 3) return null; // safeguard; use heuristic for n>3

  const isMaximizing = player === "X";
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] == null) {
      const next = board.slice();
      next[i] = player;
      const score = minimax(next, 3, 0, !isMaximizing);
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

/* ========== Lightweight heuristic for n>3 ========== */
function findBestMoveHeuristic(board, n, player) {
  const foe = player === "X" ? "O" : "X";

  // 1) Win now
  for (let i = 0; i < n * n; i++) {
    if (board[i] == null) {
      const t = board.slice();
      t[i] = player;
      if (calculateWinnerN(t, n) === player) return i;
    }
  }

  // 2) Block opponent
  for (let i = 0; i < n * n; i++) {
    if (board[i] == null) {
      const t = board.slice();
      t[i] = foe;
      if (calculateWinnerN(t, n) === foe) return i;
    }
  }

  // 3) Prefer center, then corners, then others
  const center = Math.floor(n / 2);
  const centerIdx = center * n + center;
  if (board[centerIdx] == null) return centerIdx;

  const corners = [
    0,
    n - 1,
    (n - 1) * n,
    n * n - 1,
  ];
  for (const i of corners) if (board[i] == null) return i;

  // 4) First available
  for (let i = 0; i < n * n; i++) if (board[i] == null) return i;

  return null;
}
