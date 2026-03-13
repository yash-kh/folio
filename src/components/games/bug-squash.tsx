import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorTheme } from "../ui/color-theme-provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Bug {
  id: number;
  x: number;
  label: string;
  speed: number;
  createdAt: number;
}

type GameStatus = "idle" | "playing" | "game_over";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUG_LABELS = [
  "null",
  "undefined",
  "NaN",
  "404",
  "TypeError",
  "SyntaxError",
  "{}",
  "[ ]",
];

const GAME_DURATION = 45;
const MAX_MISSES = 10;
const PLAY_AREA_WIDTH = 600;
const PLAY_AREA_HEIGHT = 400;
const COMBO_WINDOW = 500; // ms to chain combo
const COMBO_DECAY = 1500; // ms before combo resets
const LS_KEY = "bug-squash-best";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomBugLabel(): string {
  return BUG_LABELS[Math.floor(Math.random() * BUG_LABELS.length)];
}

function randomX(): number {
  // Return percentage (0-100) but keep bug within bounds
  const padding = 10; // percent
  return padding + Math.random() * (100 - padding * 2);
}

function randomSpeed(): number {
  // Fall duration in seconds (3-6)
  return 3 + Math.random() * 3;
}

function getSpawnInterval(elapsed: number): number {
  // Start at 1000ms (1 bug/sec), ramp to ~333ms (~3 bugs/sec) over 45s
  const progress = Math.min(elapsed / GAME_DURATION, 1);
  return Math.max(333, 1000 - progress * 667);
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
// Main component
// ---------------------------------------------------------------------------

export default function BugSquash() {
  const { colors } = useColorTheme();
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [squashedCount, setSquashedCount] = useState(0);
  const [bottomFlash, setBottomFlash] = useState(false);
  const [squashedBugs, setSquashedBugs] = useState<Set<number>>(new Set());

  const bugIdCounter = useRef(0);
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSquashTime = useRef(0);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTime = useRef(0);
  const bestScore = useRef(getBest());
  const missedRef = useRef(0);
  const gameStatusRef = useRef<GameStatus>("idle");

  // Keep refs in sync
  useEffect(() => {
    missedRef.current = missed;
  }, [missed]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  // Cleanup all intervals
  const cleanupIntervals = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (missCheckIntervalRef.current) {
      clearInterval(missCheckIntervalRef.current);
      missCheckIntervalRef.current = null;
    }
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }
  }, []);

  // End the game
  const endGame = useCallback(
    (_reason: "time" | "misses") => {
      cleanupIntervals();
      setGameStatus("game_over");
    },
    [cleanupIntervals]
  );

  // Spawn a bug
  const spawnBug = useCallback(() => {
    if (gameStatusRef.current !== "playing") return;
    const id = bugIdCounter.current++;
    const bug: Bug = {
      id,
      x: randomX(),
      label: randomBugLabel(),
      speed: randomSpeed(),
      createdAt: Date.now(),
    };
    setBugs((prev) => [...prev, bug]);
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    cleanupIntervals();
    bugIdCounter.current = 0;
    gameStartTime.current = Date.now();
    missedRef.current = 0;
    gameStatusRef.current = "playing";

    setBugs([]);
    setScore(0);
    setMissed(0);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setSquashedCount(0);
    setSquashedBugs(new Set());
    setGameStatus("playing");
    bestScore.current = getBest();
  }, [cleanupIntervals]);

  // Game timer and spawn interval
  useEffect(() => {
    if (gameStatus !== "playing") return;

    // Countdown timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          endGame("time");
          return 0;
        }
        return next;
      });
    }, 1000);

    // Dynamic spawn interval — re-create every second to adjust rate
    let spawnTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleSpawn = () => {
      if (gameStatusRef.current !== "playing") return;
      const elapsed = (Date.now() - gameStartTime.current) / 1000;
      const interval = getSpawnInterval(elapsed);
      spawnTimer = setTimeout(() => {
        spawnBug();
        scheduleSpawn();
      }, interval);
    };
    // Spawn first bug immediately
    spawnBug();
    scheduleSpawn();

    // Check for missed bugs (reached bottom)
    missCheckIntervalRef.current = setInterval(() => {
      if (gameStatusRef.current !== "playing") return;
      const now = Date.now();
      setBugs((prev) => {
        const stillAlive: Bug[] = [];
        let newMisses = 0;
        for (const bug of prev) {
          const age = (now - bug.createdAt) / 1000;
          if (age >= bug.speed) {
            newMisses++;
          } else {
            stillAlive.push(bug);
          }
        }
        if (newMisses > 0) {
          setMissed((m) => {
            const total = m + newMisses;
            missedRef.current = total;
            if (total >= MAX_MISSES) {
              // Defer endGame to avoid state update conflicts
              setTimeout(() => endGame("misses"), 0);
            }
            return total;
          });
          setBottomFlash(true);
          setTimeout(() => setBottomFlash(false), 300);
        }
        return stillAlive;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (spawnTimer) clearTimeout(spawnTimer);
      if (missCheckIntervalRef.current) {
        clearInterval(missCheckIntervalRef.current);
        missCheckIntervalRef.current = null;
      }
    };
  }, [gameStatus, endGame, spawnBug]);

  // Save best score on game over
  useEffect(() => {
    if (gameStatus === "game_over") {
      saveBest(score);
      bestScore.current = Math.max(bestScore.current, score);
    }
  }, [gameStatus, score]);

  // Squash a bug
  const squashBug = useCallback(
    (bugId: number) => {
      if (gameStatus !== "playing") return;

      // Mark as squashed for animation
      setSquashedBugs((prev) => {
        const next = new Set(prev);
        next.add(bugId);
        return next;
      });

      // Remove after animation
      setTimeout(() => {
        setBugs((prev) => prev.filter((b) => b.id !== bugId));
        setSquashedBugs((prev) => {
          const next = new Set(prev);
          next.delete(bugId);
          return next;
        });
      }, 300);

      // Combo logic
      const now = Date.now();
      let currentCombo = 0;
      if (now - lastSquashTime.current < COMBO_WINDOW) {
        setCombo((prev) => {
          currentCombo = prev + 1;
          return currentCombo;
        });
      } else {
        currentCombo = 1;
        setCombo(1);
      }
      lastSquashTime.current = now;

      // Reset combo after decay
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(0);
      }, COMBO_DECAY);

      // Calculate points with multiplier
      const multiplier = Math.max(1, currentCombo);
      const points = 10 * multiplier;
      setScore((prev) => prev + points);
      setSquashedCount((prev) => prev + 1);
    },
    [gameStatus]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupIntervals();
  }, [cleanupIntervals]);

  const isNewBest = gameStatus === "game_over" && score > 0 && score >= bestScore.current;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "monospace",
        color: "#fff",
        padding: "20px 0",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: colors.accent,
          marginBottom: 4,
        }}
      >
        Bug Squash
      </h2>
      <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20 }}>
        Click the bugs before they reach production
      </p>

      {/* Score bar — visible during play and game over */}
      {(gameStatus === "playing" || gameStatus === "game_over") && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            marginBottom: 16,
            fontSize: 14,
            color: "#ccc",
          }}
        >
          <span>
            Score: <strong style={{ color: colors.accent }}>{score}</strong>
          </span>
          <span>
            Time:{" "}
            <strong style={{ color: timeLeft <= 10 ? "#FF4444" : colors.accent }}>
              {timeLeft}s
            </strong>
          </span>
          <span>
            Missed:{" "}
            <strong style={{ color: missed >= 7 ? "#FF4444" : colors.accent }}>
              {missed}/{MAX_MISSES}
            </strong>
          </span>
          {combo > 1 && (
            <motion.span
              key={combo}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: colors.accent, fontWeight: 700 }}
            >
              x{combo} COMBO
            </motion.span>
          )}
        </div>
      )}

      {/* Play area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: PLAY_AREA_WIDTH,
          height: PLAY_AREA_HEIGHT,
          background: colors.bg,
          border: `1px solid rgba(${colors.accentRgb}, 0.2)`,
          borderRadius: 8,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* IDLE state */}
        {gameStatus === "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 4 }}>{"🐛"}</div>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 13,
                textAlign: "center",
                maxWidth: 320,
                lineHeight: 1.6,
              }}
            >
              Bugs are raining into production! Click them before they reach the
              bottom. Miss 10 and it&apos;s game over.
            </p>
            <button
              onClick={startGame}
              style={{
                background: "transparent",
                border: `2px solid ${colors.accent}`,
                color: colors.accent,
                padding: "12px 32px",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${colors.accentRgb}, 0.15)`;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Click Start to Debug
            </button>
          </div>
        )}

        {/* Falling bugs */}
        <AnimatePresence>
          {gameStatus === "playing" &&
            bugs.map((bug) => {
              const isSquashed = squashedBugs.has(bug.id);

              return (
                <motion.div
                  key={bug.id}
                  initial={{ top: -40, opacity: 1 }}
                  animate={
                    isSquashed
                      ? {
                          scale: [1, 1.5, 0],
                          opacity: [1, 1, 0],
                          backgroundColor: [
                            "rgba(255,68,68,0.15)",
                            `rgba(${colors.accentRgb}, 0.6)`,
                            `rgba(${colors.accentRgb}, 0)`,
                          ],
                          borderColor: [
                            "rgba(255,68,68,0.4)",
                            `rgba(${colors.accentRgb}, 1)`,
                            `rgba(${colors.accentRgb}, 0)`,
                          ],
                          color: [
                            "#FF4444",
                            colors.accent,
                            colors.accent,
                          ],
                        }
                      : {
                          top: PLAY_AREA_HEIGHT + 10,
                          opacity: 1,
                          scale: 1,
                        }
                  }
                  exit={{ opacity: 0, scale: 0 }}
                  transition={
                    isSquashed
                      ? { duration: 0.3, ease: "easeOut" }
                      : {
                          top: {
                            duration: bug.speed,
                            ease: "linear",
                          },
                          opacity: { duration: 0.15 },
                        }
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSquashed) squashBug(bug.id);
                  }}
                  style={{
                    position: "absolute",
                    left: `${bug.x}%`,
                    transform: "translateX(-50%)",
                    background: "rgba(255,68,68,0.15)",
                    border: "1px solid rgba(255,68,68,0.4)",
                    borderRadius: 9999,
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 4,
                    paddingBottom: 4,
                    fontSize: 13,
                    color: "#FF4444",
                    fontFamily: "monospace",
                    cursor: isSquashed ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    zIndex: 5,
                    pointerEvents: isSquashed ? "none" : "auto",
                  }}
                >
                  {bug.label}
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* Bottom red flash on miss */}
        <AnimatePresence>
          {bottomFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 6,
                background: "#FF4444",
                boxShadow: "0 0 20px rgba(255,68,68,0.6)",
                zIndex: 10,
              }}
            />
          )}
        </AnimatePresence>

        {/* GAME OVER overlay */}
        <AnimatePresence>
          {gameStatus === "game_over" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `rgba(${colors.bgRgb}, 0.95)`,
                zIndex: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  style={{ fontSize: 36, marginBottom: 8 }}
                >
                  {missed >= MAX_MISSES ? "🔥" : "🎉"}
                </motion.div>

                {missed >= MAX_MISSES && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      color: "#FF4444",
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    Production is down! 🔥
                  </motion.p>
                )}

                {/* Terminal-style score */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(0,255,0,0.3)",
                    borderRadius: 8,
                    padding: "16px 24px",
                    marginBottom: 20,
                    textAlign: "left",
                  }}
                >
                  <p style={{ color: "#4ADE80", fontSize: 13, marginBottom: 6 }}>
                    $ git log --oneline -1
                  </p>
                  <p style={{ color: "#4ADE80", fontSize: 14, fontWeight: 700 }}>
                    fix: squashed {squashedCount} bugs in {GAME_DURATION - timeLeft}s
                  </p>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: 12,
                      marginTop: 8,
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: 8,
                    }}
                  >
                    Score:{" "}
                    <span style={{ color: colors.accent, fontWeight: 700 }}>
                      {score}
                    </span>
                    {" | "}
                    Best:{" "}
                    <span style={{ color: colors.accent, fontWeight: 700 }}>
                      {bestScore.current || "—"}
                    </span>
                  </p>
                </motion.div>

                {isNewBest && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200,
                    }}
                    style={{
                      display: "inline-block",
                      background: `rgba(${colors.accentRgb}, 0.15)`,
                      border: `1px solid ${colors.accent}`,
                      color: colors.accent,
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    New Personal Best!
                  </motion.div>
                )}

                <div>
                  <button
                    onClick={startGame}
                    style={{
                      background: colors.accent,
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
    </div>
  );
}
