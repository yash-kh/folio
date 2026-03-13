import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorTheme } from "../ui/color-theme-provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameStatus = "idle" | "playing" | "game_over";

type CellState = "idle" | "active" | "hit" | "missed" | "wrong";

interface GameState {
  status: GameStatus;
  score: number;
  combo: number;
  hits: number;
  misses: number;
  activeCell: number | null;
  cellStates: CellState[];
  timeLeft: number;
  speed: number;
}

type GameAction =
  | { type: "START" }
  | { type: "ACTIVATE_CELL"; index: number }
  | { type: "HIT"; index: number }
  | { type: "MISS" }
  | { type: "WRONG_CLICK"; index: number }
  | { type: "CLEAR_CELL_STATE"; index: number }
  | { type: "TICK" }
  | { type: "PENALTY" }
  | { type: "GAME_OVER" }
  | { type: "RESET" };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 16;
const GAME_DURATION = 45;
const INITIAL_SPEED = 1500;
const MIN_SPEED = 400;
const SPEED_DECREASE = 50;
const SPEED_INTERVAL = 3;
const LS_KEY = "debug-grid-best";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBest(): number {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

function saveBest(score: number) {
  try {
    const prev = getBest();
    if (score > prev) localStorage.setItem(LS_KEY, String(score));
  } catch {
    /* noop */
  }
}

function getRandomCell(exclude: number | null): number {
  let next: number;
  do {
    next = Math.floor(Math.random() * GRID_SIZE);
  } while (next === exclude);
  return next;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function initState(): GameState {
  return {
    status: "idle",
    score: 0,
    combo: 0,
    hits: 0,
    misses: 0,
    activeCell: null,
    cellStates: Array(GRID_SIZE).fill("idle"),
    timeLeft: GAME_DURATION,
    speed: INITIAL_SPEED,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return {
        ...initState(),
        status: "playing",
      };

    case "ACTIVATE_CELL": {
      const newCellStates = [...state.cellStates];
      // Clear previous active cell
      for (let i = 0; i < GRID_SIZE; i++) {
        if (newCellStates[i] === "active") newCellStates[i] = "idle";
      }
      newCellStates[action.index] = "active";
      return {
        ...state,
        activeCell: action.index,
        cellStates: newCellStates,
      };
    }

    case "HIT": {
      const newCombo = state.combo + 1;
      const points = 10 * newCombo;
      const newHits = state.hits + 1;
      const speedReductions = Math.floor(newHits / SPEED_INTERVAL);
      const newSpeed = Math.max(
        MIN_SPEED,
        INITIAL_SPEED - speedReductions * SPEED_DECREASE
      );
      const newCellStates = [...state.cellStates];
      newCellStates[action.index] = "hit";
      return {
        ...state,
        score: state.score + points,
        combo: newCombo,
        hits: newHits,
        activeCell: null,
        cellStates: newCellStates,
        speed: newSpeed,
      };
    }

    case "MISS": {
      const newCellStates = [...state.cellStates];
      if (state.activeCell !== null) {
        newCellStates[state.activeCell] = "missed";
      }
      return {
        ...state,
        combo: 0,
        misses: state.misses + 1,
        activeCell: null,
        cellStates: newCellStates,
      };
    }

    case "WRONG_CLICK": {
      const newCellStates = [...state.cellStates];
      newCellStates[action.index] = "wrong";
      return {
        ...state,
        cellStates: newCellStates,
        timeLeft: Math.max(0, state.timeLeft - 1),
      };
    }

    case "CLEAR_CELL_STATE": {
      const newCellStates = [...state.cellStates];
      if (
        newCellStates[action.index] === "hit" ||
        newCellStates[action.index] === "missed" ||
        newCellStates[action.index] === "wrong"
      ) {
        newCellStates[action.index] = "idle";
      }
      return { ...state, cellStates: newCellStates };
    }

    case "TICK": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, status: "game_over", activeCell: null };
      }
      return { ...state, timeLeft: newTime };
    }

    case "PENALTY":
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

    case "GAME_OVER":
      return { ...state, status: "game_over", activeCell: null };

    case "RESET":
      return initState();

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DebugGrid() {
  const { colors } = useColorTheme();
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const {
    status,
    score,
    combo,
    hits,
    misses,
    activeCell,
    cellStates,
    timeLeft,
    speed,
  } = state;

  const cellTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const best = useRef(getBest());

  // Activate a new random cell
  const activateCell = useCallback(
    (excludeIndex: number | null) => {
      const next = getRandomCell(excludeIndex);
      dispatch({ type: "ACTIVATE_CELL", index: next });
    },
    []
  );

  // Schedule cell timeout (miss if not clicked in time)
  const scheduleCellTimeout = useCallback(
    (currentSpeed: number) => {
      if (cellTimeoutRef.current) clearTimeout(cellTimeoutRef.current);
      cellTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "MISS" });
      }, currentSpeed);
    },
    []
  );

  // When activeCell changes during play, schedule timeout
  useEffect(() => {
    if (status !== "playing") return;
    if (activeCell !== null) {
      scheduleCellTimeout(speed);
    }
    return () => {
      if (cellTimeoutRef.current) clearTimeout(cellTimeoutRef.current);
    };
  }, [activeCell, status, speed, scheduleCellTimeout]);

  // After a miss, activate next cell
  useEffect(() => {
    if (status !== "playing") return;
    if (activeCell === null) {
      // Small delay before next cell appears
      const t = setTimeout(() => {
        activateCell(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [activeCell, status, activateCell]);

  // Game timer countdown
  useEffect(() => {
    if (status === "playing") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Handle game over
  useEffect(() => {
    if (status === "game_over") {
      if (cellTimeoutRef.current) clearTimeout(cellTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      saveBest(score);
      best.current = Math.max(best.current, score);
    }
  }, [status, score]);

  // Clear cell visual states after animation
  useEffect(() => {
    cellStates.forEach((cs, i) => {
      if (cs === "hit" || cs === "missed" || cs === "wrong") {
        const t = setTimeout(() => {
          dispatch({ type: "CLEAR_CELL_STATE", index: i });
        }, cs === "wrong" ? 300 : 400);
        return () => clearTimeout(t);
      }
    });
  }, [cellStates]);

  const handleStart = useCallback(() => {
    best.current = getBest();
    dispatch({ type: "START" });
  }, []);

  const handleCellClick = useCallback(
    (index: number) => {
      if (status !== "playing") return;

      if (index === activeCell) {
        // Hit!
        if (cellTimeoutRef.current) clearTimeout(cellTimeoutRef.current);
        dispatch({ type: "HIT", index });
      } else {
        // Wrong cell
        dispatch({ type: "WRONG_CLICK", index });
      }
    },
    [status, activeCell]
  );

  const handlePlayAgain = useCallback(() => {
    best.current = getBest();
    dispatch({ type: "RESET" });
  }, []);

  // ---------------------------------------------------------------------------
  // Cell style helpers
  // ---------------------------------------------------------------------------

  function getCellStyle(index: number): React.CSSProperties {
    const cs = cellStates[index];
    const base: React.CSSProperties = {
      aspectRatio: "1",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: status === "playing" ? "pointer" : "default",
      transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
      userSelect: "none",
      WebkitTapHighlightColor: "transparent",
    };

    switch (cs) {
      case "active":
        return {
          ...base,
          background: colors.accent,
          border: `1px solid ${colors.accent}`,
          boxShadow: `0 0 20px rgba(${colors.accentRgb},0.5)`,
        };
      case "hit":
        return {
          ...base,
          background: "rgba(34,197,94,0.4)",
          border: "1px solid rgba(34,197,94,0.7)",
          boxShadow: "0 0 12px rgba(34,197,94,0.3)",
        };
      case "missed":
        return {
          ...base,
          background: "rgba(239,68,68,0.3)",
          border: "1px solid rgba(239,68,68,0.5)",
        };
      case "wrong":
        return {
          ...base,
          background: colors.bgLight,
          border: "1px solid rgba(239,68,68,0.7)",
        };
      default:
        return {
          ...base,
          background: colors.bgLight,
          border: `1px solid rgba(${colors.secondaryRgb},0.15)`,
        };
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const timerPercent = (timeLeft / GAME_DURATION) * 100;
  const isNewBest = status === "game_over" && score >= best.current && score > 0;

  return (
    <div
      className="container pt-4 relative pb-20"
      id="debug-grid"
      style={{ fontFamily: "monospace" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Debug the Grid
        </h2>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20 }}>
          Squash the bugs before they vanish
        </p>
      </div>

      {/* Score & Timer area */}
      {status === "playing" && (
        <div style={{ maxWidth: 350, margin: "0 auto 16px" }}>
          {/* Score and combo row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 14, color: "#9ca3af" }}>
              Score:{" "}
              <span
                style={{ color: colors.accent, fontSize: 22, fontWeight: 700 }}
              >
                {score}
              </span>
            </div>

            {/* Combo / streak */}
            <AnimatePresence>
              {combo >= 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{
                    color: colors.accent,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {combo >= 3 ? "\uD83D\uDD25 " : ""}
                  {combo}x streak
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ fontSize: 14, color: "#9ca3af" }}>
              <span style={{ color: colors.accent, fontWeight: 700 }}>
                {timeLeft}
              </span>
              s
            </div>
          </div>

          {/* Timer bar */}
          <div
            style={{
              width: "100%",
              height: 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background:
                  timeLeft <= 10
                    ? "#ef4444"
                    : timeLeft <= 20
                    ? "#f59e0b"
                    : colors.accent,
                borderRadius: 2,
              }}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            maxWidth: 350,
            width: "100%",
            position: "relative",
          }}
        >
          {Array.from({ length: GRID_SIZE }).map((_, index) => {
            const cs = cellStates[index];

            return (
              <motion.div
                key={index}
                style={getCellStyle(index)}
                animate={
                  cs === "active"
                    ? { scale: [1, 1.05, 1] }
                    : cs === "hit"
                    ? { scale: [1, 1.2, 0.9, 1] }
                    : cs === "missed"
                    ? { scale: [1, 0.85, 1] }
                    : { scale: 1 }
                }
                transition={
                  cs === "active"
                    ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                    : cs === "hit"
                    ? { duration: 0.35, ease: "easeOut" }
                    : cs === "missed"
                    ? { duration: 0.3, ease: "easeOut" }
                    : { duration: 0.15 }
                }
                onClick={() => handleCellClick(index)}
                whileTap={status === "playing" ? { scale: 0.92 } : undefined}
              >
                {cs === "active" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ fontSize: 22, lineHeight: 1 }}
                  >
                    {"\uD83D\uDC1B"}
                  </motion.span>
                )}
              </motion.div>
            );
          })}

          {/* IDLE overlay */}
          <AnimatePresence>
            {status === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `rgba(${colors.bgRgb},0.85)`,
                  borderRadius: 12,
                  zIndex: 10,
                  gap: 16,
                }}
              >
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    textAlign: "center",
                    maxWidth: 240,
                    lineHeight: 1.5,
                  }}
                >
                  Click the lit cells before they vanish. Speed increases as you
                  score!
                </div>
                <button
                  onClick={handleStart}
                  style={{
                    background: colors.accent,
                    border: "none",
                    color: colors.bgLight,
                    padding: "12px 36px",
                    borderRadius: 8,
                    fontFamily: "monospace",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Tap Start
                </button>
                {best.current > 0 && (
                  <div style={{ color: colors.accent, fontSize: 13 }}>
                    Best: {best.current}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats during play */}
      {status === "playing" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 16,
            fontSize: 13,
            color: "#9ca3af",
          }}
        >
          <span>
            Hits:{" "}
            <strong style={{ color: "#22c55e" }}>{hits}</strong>
          </span>
          <span>
            Misses:{" "}
            <strong style={{ color: "#ef4444" }}>{misses}</strong>
          </span>
          <span>
            Speed:{" "}
            <strong style={{ color: colors.secondary }}>
              {(speed / 1000).toFixed(2)}s
            </strong>
          </span>
        </div>
      )}

      {/* Game Over overlay */}
      <AnimatePresence>
        {status === "game_over" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `rgba(${colors.bgRgb},0.95)`,
              borderRadius: 16,
              zIndex: 20,
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontFamily: "monospace",
                color: "#fff",
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{ fontSize: 36, marginBottom: 8 }}
              >
                {"\u23F0"}
              </motion.div>
              <h2
                style={{
                  fontSize: 28,
                  color: colors.accent,
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Time&apos;s Up!
              </h2>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: colors.accent,
                  marginBottom: 4,
                }}
              >
                {score}
              </motion.div>
              <div
                style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20 }}
              >
                points
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 32,
                  justifyContent: "center",
                  marginBottom: 20,
                  fontSize: 14,
                  color: "#9ca3af",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {hits}
                  </div>
                  <div>Hits</div>
                </div>
                <div>
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {misses}
                  </div>
                  <div>Misses</div>
                </div>
                <div>
                  <div
                    style={{
                      color: colors.secondary,
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {hits + misses > 0
                      ? Math.round((hits / (hits + misses)) * 100)
                      : 0}
                    %
                  </div>
                  <div>Accuracy</div>
                </div>
              </div>

              {isNewBest && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  style={{
                    display: "inline-block",
                    background: `rgba(${colors.accentRgb},0.15)`,
                    border: `1px solid ${colors.accent}`,
                    color: colors.accent,
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  New Personal Best!
                </motion.div>
              )}

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handlePlayAgain}
                  style={{
                    background: colors.accent,
                    border: "none",
                    color: colors.bgLight,
                    padding: "12px 32px",
                    borderRadius: 8,
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
