import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorTheme } from "../ui/color-theme-provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CodeSnippet {
  lines: string[];
  bugLine: number;
  explanation: string;
}

type GameStatus = "idle" | "playing" | "game_over";

interface Feedback {
  type: "correct" | "wrong";
  lineIndex: number;
  explanation?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GAME_DURATION = 45;
const PENALTY_SECONDS = 5;
const FEEDBACK_DURATION = 1000;

const SNIPPETS: CodeSnippet[] = [
  {
    lines: [
      "async function getUsers() {",
      "  const response = fetch('/api/users');",
      "  const data = await response.json();",
      "  return data.users;",
      "}",
    ],
    bugLine: 1,
    explanation:
      "Missing 'await' before fetch(). fetch() returns a Promise, so response will be a pending Promise instead of the actual Response object.",
  },
  {
    lines: [
      "function isEmpty(arr: string[]) {",
      "  if (arr.length = 0) {",
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
    bugLine: 1,
    explanation:
      "Using assignment '=' instead of comparison '==='. This assigns 0 to arr.length and always evaluates to false.",
  },
  {
    lines: [
      "function sumArray(arr: number[]) {",
      "  let total = 0;",
      "  for (let i = 0; i <= arr.length; i++) {",
      "    total += arr[i];",
      "  }",
      "  return total;",
      "}",
    ],
    bugLine: 2,
    explanation:
      "Off-by-one error: '<=' should be '<'. When i equals arr.length, arr[i] is undefined, resulting in NaN.",
  },
  {
    lines: [
      "interface User { name: string; age: number }",
      "",
      "function greet(users: User[]) {",
      "  for (const u of users) {",
      '    console.log(`Hello, ${user.name}!`);',
      "  }",
      "}",
    ],
    bugLine: 4,
    explanation:
      "Undefined variable: 'user' should be 'u'. The loop variable is declared as 'u', not 'user'.",
  },
  {
    lines: [
      "const add = (a: number, b: number) => {",
      "  a + b;",
      "};",
      "",
      "console.log(add(2, 3)); // undefined",
    ],
    bugLine: 1,
    explanation:
      "Missing 'return' statement. Arrow functions with curly braces need an explicit return. Should be 'return a + b;'.",
  },
  {
    lines: [
      "const numbers = [1, 2, 3, 4, 5];",
      "",
      "const doubled = numbers.forEach((n) => {",
      "  return n * 2;",
      "});",
      "",
      "console.log(doubled); // undefined",
    ],
    bugLine: 2,
    explanation:
      "Wrong array method: forEach() always returns undefined. Use .map() to create a transformed array.",
  },
  {
    lines: [
      "async function handleResponse(res: Response) {",
      "  const status = res.headers.get('x-status');",
      "  if (status == 200) {",
      '    console.log("Success");',
      "  } else {",
      '    console.log("Failed");',
      "  }",
      "}",
    ],
    bugLine: 2,
    explanation:
      "Type coercion issue: header values are strings. '== 200' coerces loosely. Use '=== \"200\"' for safe comparison.",
  },
  {
    lines: [
      "function addItem(state: { items: string[] }, item: string) {",
      "  state.items.push(item);",
      "  return state;",
      "}",
      "",
      "// Used in a React reducer",
    ],
    bugLine: 1,
    explanation:
      "Mutating state directly. In React, you must return a new object: return { ...state, items: [...state.items, item] }.",
  },
  {
    lines: [
      "function findUser(users: User[], id: number) {",
      "  const result = users.find((u) => u.id === id);",
      "  return result.name;",
      "}",
      "",
      "// crashes if user not found",
    ],
    bugLine: 2,
    explanation:
      "Unsafe access: .find() can return undefined. Accessing .name on undefined throws a TypeError. Use optional chaining: result?.name.",
  },
  {
    lines: [
      "useEffect(() => {",
      "  const timer = setInterval(() => {",
      "    setCount((c) => c + 1);",
      "  }, 1000);",
      "}, []);",
    ],
    bugLine: 4,
    explanation:
      "Missing cleanup. The interval is never cleared, causing a memory leak. Add 'return () => clearInterval(timer);' before closing the effect.",
  },
  {
    lines: [
      "const [items, setItems] = useState<string[]>([]);",
      "",
      "async function loadItems() {",
      "  const res = await fetch('/api/items');",
      "  const data = await res.json();",
      "  setItems(data);",
      "}",
      "",
      "loadItems();",
    ],
    bugLine: 8,
    explanation:
      "Calling async function directly in render body causes infinite re-renders. Wrap in useEffect to run on mount only.",
  },
  {
    lines: [
      "function debounce(fn: Function, ms: number) {",
      "  let timer: NodeJS.Timeout;",
      "  return (...args: any[]) => {",
      "    clearTimeout(timer);",
      "    timer = setTimeout(() => fn(args), ms);",
      "  };",
      "}",
    ],
    bugLine: 4,
    explanation:
      "Incorrect spread: fn(args) passes the array as a single argument. Should be fn(...args) to spread the arguments.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DebugRush() {
  const { colors } = useColorTheme();
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [shaking, setShaking] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------------
  // Timer countdown
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (gameStatus !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameStatus("game_over");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // -------------------------------------------------------------------------
  // Start / Restart
  // -------------------------------------------------------------------------

  const startGame = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    const shuffled = shuffleArray(SNIPPETS);
    setSnippets(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    setShaking(false);
    setTransitioning(false);
    setGameStatus("playing");
  }, []);

  // -------------------------------------------------------------------------
  // Line click handler
  // -------------------------------------------------------------------------

  const handleLineClick = useCallback(
    (lineIndex: number) => {
      if (gameStatus !== "playing" || feedback || transitioning) return;

      const snippet = snippets[currentIndex];
      if (!snippet) return;

      // Skip blank lines
      if (snippet.lines[lineIndex].trim() === "") return;

      if (lineIndex === snippet.bugLine) {
        // Correct!
        setScore((s) => s + 1);
        setFeedback({
          type: "correct",
          lineIndex,
          explanation: snippet.explanation,
        });
        setTransitioning(true);

        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback(null);
          setTransitioning(false);

          if (currentIndex + 1 < snippets.length) {
            setCurrentIndex((i) => i + 1);
          } else {
            // Reshuffle and continue
            const reshuffled = shuffleArray(SNIPPETS);
            setSnippets(reshuffled);
            setCurrentIndex(0);
          }
        }, FEEDBACK_DURATION);
      } else {
        // Wrong!
        setFeedback({ type: "wrong", lineIndex });
        setShaking(true);
        setTimeLeft((prev) => Math.max(0, prev - PENALTY_SECONDS));

        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback(null);
          setShaking(false);

          setTimeLeft((prev) => {
            if (prev <= 0) {
              setGameStatus("game_over");
            }
            return prev;
          });
        }, 500);
      }
    },
    [gameStatus, feedback, transitioning, snippets, currentIndex]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Current snippet
  // -------------------------------------------------------------------------

  const currentSnippet = snippets[currentIndex] ?? null;
  const timerPercent = (timeLeft / GAME_DURATION) * 100;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Space Grotesk', monospace",
        padding: "20px 16px",
        width: "100%",
      }}
    >
      {/* IDLE state */}
      <AnimatePresence mode="wait">
        {gameStatus === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: "center",
              maxWidth: 600,
              width: "100%",
            }}
          >
            <div
              style={{
                background: colors.bgLight,
                border: `1px solid rgba(${colors.secondaryRgb},0.3)`,
                borderRadius: 12,
                padding: "48px 32px",
              }}
            >
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.accent,
                  marginBottom: 16,
                  fontFamily: "'Space Grotesk', monospace",
                }}
              >
                Find the Bug
              </h2>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 1.8,
                  marginBottom: 8,
                  fontFamily: "monospace",
                }}
              >
                Each snippet has exactly <strong style={{ color: "#e2e8f0" }}>one bug</strong>.
                <br />
                Click the buggy line to score a point.
              </p>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  lineHeight: 1.8,
                  marginBottom: 32,
                  fontFamily: "monospace",
                }}
              >
                Wrong guess costs you{" "}
                <strong style={{ color: "#ff4444" }}>5 seconds</strong>.
                <br />
                You have{" "}
                <strong style={{ color: colors.accent }}>45 seconds</strong>.
                <br />
                Find as many bugs as you can!
              </p>

              <button
                onClick={startGame}
                style={{
                  background: colors.accent,
                  border: "none",
                  color: colors.bgLight,
                  padding: "14px 48px",
                  borderRadius: 8,
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    `0 0 20px rgba(${colors.accentRgb},0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Start
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYING state */}
        {gameStatus === "playing" && currentSnippet && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: 600, width: "100%" }}
          >
            {/* Top bar: snippet counter + score */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              <span style={{ color: "#9ca3af" }}>
                Snippet{" "}
                <strong style={{ color: colors.secondary }}>
                  {currentIndex + 1}
                </strong>
              </span>
              <span style={{ color: "#9ca3af" }}>
                Time:{" "}
                <strong
                  style={{
                    color: timeLeft <= 10 ? "#ff4444" : colors.accent,
                    fontSize: 16,
                  }}
                >
                  {timeLeft}s
                </strong>
              </span>
              <span style={{ color: "#9ca3af" }}>
                Bugs Found:{" "}
                <strong style={{ color: colors.accent, fontSize: 16 }}>
                  {score}
                </strong>
              </span>
            </div>

            {/* Code box */}
            <motion.div
              animate={
                shaking
                  ? { x: [0, -4, 4, -4, 4, -2, 2, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              style={{
                background: colors.bgLight,
                border: `1px solid rgba(${colors.secondaryRgb},0.3)`,
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Timer bar */}
              <div
                style={{
                  position: "relative",
                  height: 3,
                  background: `rgba(${colors.accentRgb},0.1)`,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    background: timeLeft <= 10 ? "#ff4444" : colors.accent,
                    borderRadius: 2,
                  }}
                  animate={{ width: `${timerPercent}%` }}
                  transition={{ duration: 0.3, ease: "linear" }}
                />
              </div>

              {/* Code lines */}
              <div style={{ padding: "16px 0" }}>
                {currentSnippet.lines.map((line, idx) => {
                  const isBlank = line.trim() === "";
                  const isCorrectFeedback =
                    feedback?.type === "correct" && feedback.lineIndex === idx;
                  const isWrongFeedback =
                    feedback?.type === "wrong" && feedback.lineIndex === idx;

                  let lineBg = "transparent";
                  if (isCorrectFeedback) lineBg = "rgba(0,255,136,0.2)";
                  else if (isWrongFeedback) lineBg = "rgba(255,68,68,0.2)";

                  return (
                    <div
                      key={idx}
                      onClick={() => !isBlank && handleLineClick(idx)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        padding: "4px 16px 4px 0",
                        cursor: isBlank ? "default" : "pointer",
                        background: lineBg,
                        transition: "background 0.15s",
                        minHeight: 28,
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isBlank && !feedback) {
                          e.currentTarget.style.background =
                            `rgba(${colors.accentRgb},0.05)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCorrectFeedback && !isWrongFeedback) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {/* Line number */}
                      <span
                        style={{
                          display: "inline-block",
                          width: 48,
                          textAlign: "right",
                          paddingRight: 16,
                          color: colors.secondary,
                          opacity: 0.5,
                          fontSize: 13,
                          fontFamily: "'Space Grotesk', monospace",
                          flexShrink: 0,
                          lineHeight: "20px",
                        }}
                      >
                        {idx + 1}
                      </span>
                      {/* Code */}
                      <span
                        style={{
                          color: "#e2e8f0",
                          fontSize: 13,
                          fontFamily: "'Space Grotesk', monospace",
                          whiteSpace: "pre",
                          lineHeight: "20px",
                        }}
                      >
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation banner */}
              <AnimatePresence>
                {feedback?.type === "correct" && feedback.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      borderTop: "1px solid rgba(0,255,136,0.3)",
                      background: "rgba(0,255,136,0.08)",
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#00ff88",
                      fontFamily: "monospace",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Bug found!</strong> {feedback.explanation}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wrong penalty banner */}
              <AnimatePresence>
                {feedback?.type === "wrong" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      borderTop: "1px solid rgba(255,68,68,0.3)",
                      background: "rgba(255,68,68,0.08)",
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "#ff4444",
                      fontFamily: "monospace",
                    }}
                  >
                    <strong>Wrong line!</strong> -5 seconds penalty
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* GAME OVER state */}
        {gameStatus === "game_over" && (
          <motion.div
            key="game_over"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              textAlign: "center",
              maxWidth: 600,
              width: "100%",
            }}
          >
            <div
              style={{
                background: colors.bgLight,
                border: `1px solid rgba(${colors.secondaryRgb},0.3)`,
                borderRadius: 12,
                padding: "48px 32px",
              }}
            >
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ff4444",
                  marginBottom: 8,
                  fontFamily: "'Space Grotesk', monospace",
                }}
              >
                {"Time's Up!"}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 48,
                    margin: "32px 0",
                    fontFamily: "monospace",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 40,
                        fontWeight: 700,
                        color: colors.accent,
                      }}
                    >
                      {score}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
                      Bugs Found
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    marginBottom: 32,
                    fontFamily: "monospace",
                  }}
                >
                  {score === 0
                    ? "No bugs caught this time. Try again!"
                    : score <= 3
                    ? "Not bad! Can you find more?"
                    : score <= 6
                    ? "Nice debugging skills!"
                    : "Impressive! You have a sharp eye for bugs."}
                </p>

                <button
                  onClick={startGame}
                  style={{
                    background: colors.accent,
                    border: "none",
                    color: colors.bgLight,
                    padding: "14px 48px",
                    borderRadius: 8,
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      `0 0 20px rgba(${colors.accentRgb},0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Play Again
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
