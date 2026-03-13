import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  siReact,
  siTypescript,
  siNextdotjs,
  siPostgresql,
  siDocker,
  siAmazonwebservices,
  siMongodb,
  siAngular,
} from "simple-icons/icons";
import { useColorTheme } from "../ui/color-theme-provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IconDef {
  title: string;
  path: string;
  hex: string;
}

interface Card {
  id: number;
  pairId: number;
  icon: IconDef;
}

type GameStatus = "idle" | "playing" | "won";

interface GameState {
  cards: Card[];
  flippedIndices: number[];
  matchedPairs: Set<number>;
  moves: number;
  gameStatus: GameStatus;
  streak: number;
  startTime: number | null;
  elapsed: number;
}

type GameAction =
  | { type: "FLIP_CARD"; index: number }
  | { type: "CHECK_MATCH" }
  | { type: "RESET_FLIPPED" }
  | { type: "NEW_GAME" }
  | { type: "TICK" };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICONS: IconDef[] = [
  { title: "React", path: siReact.path, hex: siReact.hex },
  { title: "TypeScript", path: siTypescript.path, hex: siTypescript.hex },
  { title: "Next.js", path: siNextdotjs.path, hex: siNextdotjs.hex },
  { title: "PostgreSQL", path: siPostgresql.path, hex: siPostgresql.hex },
  { title: "Docker", path: siDocker.path, hex: siDocker.hex },
  { title: "AWS", path: siAmazonwebservices.path, hex: siAmazonwebservices.hex },
  { title: "MongoDB", path: siMongodb.path, hex: siMongodb.hex },
  { title: "Angular", path: siAngular.path, hex: siAngular.hex },
];

const LS_KEY = "stack-match-best";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs: Card[] = [];
  ICONS.forEach((icon, idx) => {
    pairs.push({ id: idx * 2, pairId: idx, icon });
    pairs.push({ id: idx * 2 + 1, pairId: idx, icon });
  });
  return fisherYatesShuffle(pairs);
}

function calcScore(moves: number, elapsed: number, streak: number): number {
  let multiplier = 1;
  if (elapsed < 30) multiplier = 3;
  else if (elapsed < 60) multiplier = 2;
  else if (elapsed < 90) multiplier = 1.5;

  const base = 8 * 100 * multiplier;
  const streakBonus = Math.max(0, streak - 2) * 50;
  return Math.round(base + streakBonus - moves * 5);
}

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

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function initState(): GameState {
  return {
    cards: buildDeck(),
    flippedIndices: [],
    matchedPairs: new Set(),
    moves: 0,
    gameStatus: "idle",
    streak: 0,
    startTime: null,
    elapsed: 0,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "FLIP_CARD": {
      if (state.flippedIndices.length >= 2) return state;
      if (state.flippedIndices.includes(action.index)) return state;
      if (state.matchedPairs.has(state.cards[action.index].pairId)) return state;

      const newFlipped = [...state.flippedIndices, action.index];
      const isFirst = state.gameStatus === "idle";

      return {
        ...state,
        flippedIndices: newFlipped,
        gameStatus: "playing",
        startTime: isFirst ? Date.now() : state.startTime,
      };
    }

    case "CHECK_MATCH": {
      if (state.flippedIndices.length !== 2) return state;
      const [a, b] = state.flippedIndices;
      const cardA = state.cards[a];
      const cardB = state.cards[b];
      const isMatch = cardA.pairId === cardB.pairId;

      if (isMatch) {
        const newMatched = new Set(state.matchedPairs);
        newMatched.add(cardA.pairId);
        const newStreak = state.streak + 1;
        const won = newMatched.size === ICONS.length;

        return {
          ...state,
          matchedPairs: newMatched,
          flippedIndices: [],
          moves: state.moves + 1,
          streak: newStreak,
          gameStatus: won ? "won" : state.gameStatus,
        };
      }

      return {
        ...state,
        moves: state.moves + 1,
        streak: 0,
      };
    }

    case "RESET_FLIPPED":
      return { ...state, flippedIndices: [] };

    case "TICK": {
      if (!state.startTime || state.gameStatus === "won") return state;
      return { ...state, elapsed: Math.floor((Date.now() - state.startTime) / 1000) };
    }

    case "NEW_GAME":
      return initState();

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CardBack({ colors }: { colors: ReturnType<typeof useColorTheme>["colors"] }) {
  return (
    <div
      className="card-back-face"
      style={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        background: colors.bg,
        border: `2px solid rgba(${colors.accentRgb}, 0.3)`,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.2s",
      }}
    >
      <span style={{ color: colors.accent, opacity: 0.4, fontSize: 28, fontWeight: 700, fontFamily: "monospace" }}>
        {"</>"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StackMatchGame() {
  const { colors } = useColorTheme();
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const { cards, flippedIndices, matchedPairs, moves, gameStatus, streak, elapsed } = state;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mismatchIndicesRef = useRef<number[]>([]);
  const justMatchedRef = useRef<Set<number>>(new Set());
  const best = useRef(getBest());

  // Timer
  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Check match after two cards flipped
  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [a, b] = flippedIndices;
      const isMatch = cards[a].pairId === cards[b].pairId;

      if (isMatch) {
        justMatchedRef.current = new Set([a, b]);
        setTimeout(() => {
          justMatchedRef.current = new Set();
        }, 600);
      }

      const delay = isMatch ? 400 : 900;

      if (!isMatch) {
        mismatchIndicesRef.current = [a, b];
        setTimeout(() => {
          mismatchIndicesRef.current = [];
        }, 400);
      }

      setTimeout(() => {
        dispatch({ type: "CHECK_MATCH" });
        if (!isMatch) {
          dispatch({ type: "RESET_FLIPPED" });
        }
      }, delay);
    }
  }, [flippedIndices, cards]);

  // Handle win
  useEffect(() => {
    if (gameStatus === "won") {
      const score = calcScore(moves, elapsed, streak);
      saveBest(score);
      best.current = Math.max(best.current, score);
    }
  }, [gameStatus, moves, elapsed, streak]);

  const handleNewGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    best.current = getBest();
    dispatch({ type: "NEW_GAME" });
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (gameStatus === "won") return;
      if (flippedIndices.length >= 2) return;
      if (matchedPairs.has(cards[index].pairId)) return;
      if (flippedIndices.includes(index)) return;
      dispatch({ type: "FLIP_CARD", index });
    },
    [gameStatus, flippedIndices, matchedPairs, cards]
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isFlipped = (index: number) =>
    flippedIndices.includes(index) || matchedPairs.has(cards[index].pairId);

  const isMatched = (index: number) => matchedPairs.has(cards[index].pairId);

  const score = gameStatus === "won" ? calcScore(moves, elapsed, streak) : 0;
  const isNewBest = gameStatus === "won" && score >= best.current;

  return (
    <>
      <style>{`
        .card-back-face { transition: border-color 0.2s; }
        .stack-card-wrapper:hover .card-back-face { border-color: rgba(var(--folio-accent-rgb), 0.7) !important; }
      `}</style>

      <div style={{ position: "relative" }}>
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 14,
            marginTop: 0,
            marginBottom: 24,
            fontFamily: "monospace",
          }}
        >
          Match my tech stack — if you can
        </p>

        {/* Score bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 20,
            fontFamily: "monospace",
            fontSize: 14,
            color: "#ccc",
          }}
        >
          <span>
            Moves: <strong style={{ color: colors.secondary }}>{moves}</strong>
          </span>
          <span>
            Time: <strong style={{ color: colors.secondary }}>{formatTime(elapsed)}</strong>
          </span>
          <span>
            Best: <strong style={{ color: colors.accent }}>{best.current || "—"}</strong>
          </span>
        </div>

        {/* Card grid */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              maxWidth: 420,
              width: "100%",
            }}
          >
            {cards.map((card, index) => {
              const flipped = isFlipped(index);
              const matched = isMatched(index);
              const isMismatch = mismatchIndicesRef.current.includes(index);
              const wasJustMatched = justMatchedRef.current.has(index);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: wasJustMatched ? [1, 1.05, 1] : 1,
                    x: isMismatch ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  transition={{
                    opacity: { delay: index * 0.04, duration: 0.3 },
                    scale: {
                      delay: index * 0.04,
                      duration: wasJustMatched ? 0.4 : 0.3,
                    },
                    x: { duration: 0.3 },
                  }}
                  className="stack-card-wrapper"
                  style={{
                    aspectRatio: "1",
                    perspective: 1000,
                    cursor: matched || flippedIndices.length >= 2 ? "default" : "pointer",
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Back face (face-down) */}
                    <CardBack colors={colors} />

                    {/* Front face (face-up) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: matched
                          ? `rgba(${colors.secondaryRgb}, 0.1)`
                          : colors.bgLight,
                        border: isMismatch
                          ? "2px solid #ef4444"
                          : `2px solid ${colors.secondary}`,
                        borderRadius: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={40}
                        height={40}
                        fill={`#${card.icon.hex}`}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d={card.icon.path} />
                      </svg>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontFamily: "monospace",
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        {card.icon.title}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Responsive sizing */}
        <style>{`
          @media (max-width: 640px) {
            .stack-card-wrapper {
              width: 20vw !important;
              height: 20vw !important;
            }
          }
        `}</style>

        {/* New Game button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={handleNewGame}
            style={{
              background: "transparent",
              border: `2px solid ${colors.secondary}`,
              color: colors.secondary,
              padding: "10px 28px",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${colors.secondaryRgb}, 0.15)`;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            New Game
          </button>
        </div>

        {/* Win overlay */}
        <AnimatePresence>
          {gameStatus === "won" && (
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
                background: `rgba(${colors.bgRgb}, 0.95)`,
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
                  style={{ fontSize: 40, marginBottom: 8 }}
                >
                  {"🎉"}
                </motion.div>
                <h2
                  style={{
                    fontSize: 28,
                    color: colors.secondary,
                    marginBottom: 24,
                    fontWeight: 700,
                  }}
                >
                  Stack Matched!
                </h2>

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
                    <div style={{ color: colors.secondary, fontSize: 24, fontWeight: 700 }}>{score}</div>
                    <div>Score</div>
                  </div>
                  <div>
                    <div style={{ color: colors.secondary, fontSize: 24, fontWeight: 700 }}>
                      {formatTime(elapsed)}
                    </div>
                    <div>Time</div>
                  </div>
                  <div>
                    <div style={{ color: colors.secondary, fontSize: 24, fontWeight: 700 }}>{moves}</div>
                    <div>Moves</div>
                  </div>
                </div>

                {isNewBest && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    style={{
                      display: "inline-block",
                      background: `rgba(${colors.accentRgb}, 0.15)`,
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
                    onClick={handleNewGame}
                    style={{
                      background: colors.secondary,
                      border: "none",
                      color: colors.bg,
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
    </>
  );
}
