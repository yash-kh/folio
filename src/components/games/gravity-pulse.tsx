import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorTheme } from "../ui/color-theme-provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameStatus = "idle" | "playing" | "won" | "game_over";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  captured: boolean;
  capturing: boolean;
  colorIndex: number;
  element: HTMLDivElement | null;
}

interface GravityWell {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLAY_WIDTH = 600;
const PLAY_HEIGHT = 400;
const PARTICLE_COUNT = 15;
const PARTICLE_SIZE = 8;
const WELL_RADIUS = 80;
const CAPTURE_RADIUS = 10;
const WELL_DURATION = 1500;
const MAX_WELLS = 3;
const GAME_DURATION = 45;
const LS_KEY = "gravity-pulse-best";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createParticles(): Omit<Particle, "element">[] {
  const particles: Omit<Particle, "element">[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      x: randomBetween(20, PLAY_WIDTH - 20),
      y: randomBetween(20, PLAY_HEIGHT - 20),
      vx: randomBetween(-1.5, 1.5),
      vy: randomBetween(-1.5, 1.5),
      captured: false,
      capturing: false,
      colorIndex: Math.floor(Math.random() * 2),
    });
  }
  return particles;
}

function calcScore(
  captured: number,
  totalClicks: number,
  elapsedSeconds: number,
  allCaptured: boolean
): { base: number; speedMultiplier: number; clickBonus: number; total: number } {
  const base = captured * 10;

  let speedMultiplier = 1;
  if (allCaptured) {
    if (elapsedSeconds < 20) speedMultiplier = 3;
    else if (elapsedSeconds < 30) speedMultiplier = 2;
    else if (elapsedSeconds < 40) speedMultiplier = 1.5;
  }

  let clickBonus = 0;
  if (allCaptured) {
    if (totalClicks < 10) clickBonus = 100;
    else if (totalClicks < 15) clickBonus = 50;
  }

  const total = Math.round(base * speedMultiplier + clickBonus);
  return { base, speedMultiplier, clickBonus, total };
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

export default function GravityPulse() {
  const { colors } = useColorTheme();

  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [capturedCount, setCapturedCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [wells, setWells] = useState<GravityWell[]>([]);
  const [capturingIds, setCapturingIds] = useState<Set<number>>(new Set());

  const particlesRef = useRef<Particle[]>([]);
  const particleElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wellIdRef = useRef(0);
  const startTimeRef = useRef(0);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const bestRef = useRef(getBest());
  const wellsRef = useRef<GravityWell[]>([]);
  const gameStatusRef = useRef<GameStatus>("idle");

  // Resolve particle colorIndex to actual color string
  const particleColors = [colors.accent, colors.secondary];

  function getParticleColor(p: Particle): string {
    return particleColors[p.colorIndex] ?? colors.accent;
  }

  // Keep refs in sync with state
  useEffect(() => {
    wellsRef.current = wells;
  }, [wells]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  // ---------------------------------------------------------------------------
  // Initialize particles
  // ---------------------------------------------------------------------------

  const initParticles = useCallback(() => {
    const data = createParticles();
    particlesRef.current = data.map((p) => ({ ...p, element: null }));
    particleElementsRef.current.clear();
  }, []);

  // Initialize on mount for idle decorative state
  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------

  const gameLoop = useCallback(() => {
    const particles = particlesRef.current;
    const currentWells = wellsRef.current;
    const now = Date.now();
    const isPlaying = gameStatusRef.current === "playing";

    let newCaptureIds: number[] = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.captured || p.capturing) continue;

      // Apply gravity from wells (only during play)
      if (isPlaying) {
        for (const well of currentWells) {
          const age = now - well.createdAt;
          if (age > WELL_DURATION) continue;

          const dx = well.x - p.x;
          const dy = well.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < WELL_RADIUS && dist > 0) {
            const strength = 2.5 / dist;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }

          // Check capture
          if (dist < CAPTURE_RADIUS) {
            p.capturing = true;
            newCaptureIds.push(p.id);
          }
        }
      }

      // Dampen velocity slightly to prevent runaway speeds
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 5) {
        p.vx = (p.vx / speed) * 5;
        p.vy = (p.vy / speed) * 5;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x <= PARTICLE_SIZE / 2) {
        p.x = PARTICLE_SIZE / 2;
        p.vx = Math.abs(p.vx);
      } else if (p.x >= PLAY_WIDTH - PARTICLE_SIZE / 2) {
        p.x = PLAY_WIDTH - PARTICLE_SIZE / 2;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y <= PARTICLE_SIZE / 2) {
        p.y = PARTICLE_SIZE / 2;
        p.vy = Math.abs(p.vy);
      } else if (p.y >= PLAY_HEIGHT - PARTICLE_SIZE / 2) {
        p.y = PLAY_HEIGHT - PARTICLE_SIZE / 2;
        p.vy = -Math.abs(p.vy);
      }

      // Update DOM position directly
      const el = particleElementsRef.current.get(p.id);
      if (el) {
        el.style.transform = `translate(${p.x - PARTICLE_SIZE / 2}px, ${p.y - PARTICLE_SIZE / 2}px)`;
      }
    }

    // Handle captures
    if (newCaptureIds.length > 0) {
      setCapturingIds((prev) => {
        const next = new Set(prev);
        newCaptureIds.forEach((id) => next.add(id));
        return next;
      });

      // After capture animation, mark as fully captured
      setTimeout(() => {
        for (const id of newCaptureIds) {
          const p = particlesRef.current.find((pp) => pp.id === id);
          if (p) p.captured = true;
        }
        setCapturingIds((prev) => {
          const next = new Set(prev);
          newCaptureIds.forEach((id) => next.delete(id));
          return next;
        });

        const remaining = particlesRef.current.filter(
          (pp) => !pp.captured
        ).length;
        const newCapturedCount = PARTICLE_COUNT - remaining;
        setCapturedCount(newCapturedCount);
        setScore(newCapturedCount * 10);

        if (remaining === 0 && gameStatusRef.current === "playing") {
          setGameStatus("won");
        }
      }, 300);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/stop animation loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop]);

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, GAME_DURATION - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setGameStatus("game_over");
        }
      }, 250);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Cleanup wells periodically
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const interval = setInterval(() => {
      const now = Date.now();
      setWells((prev) => prev.filter((w) => now - w.createdAt < WELL_DURATION));
    }, 200);
    return () => clearInterval(interval);
  }, [gameStatus]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleStart = useCallback(() => {
    initParticles();
    setGameStatus("playing");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCapturedCount(0);
    setTotalClicks(0);
    setWells([]);
    setCapturingIds(new Set());
    startTimeRef.current = Date.now();
    bestRef.current = getBest();
  }, [initParticles]);

  const handlePlayAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameStatus !== "playing") return;

      const rect = playAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setTotalClicks((prev) => prev + 1);

      const newWell: GravityWell = {
        id: wellIdRef.current++,
        x,
        y,
        createdAt: Date.now(),
      };

      setWells((prev) => {
        const updated = [...prev, newWell];
        if (updated.length > MAX_WELLS) {
          return updated.slice(updated.length - MAX_WELLS);
        }
        return updated;
      });
    },
    [gameStatus]
  );

  // ---------------------------------------------------------------------------
  // Score calculation for end screens
  // ---------------------------------------------------------------------------

  const elapsedSeconds =
    gameStatus === "won" || gameStatus === "game_over"
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

  const allCaptured = capturedCount === PARTICLE_COUNT;

  const finalScore =
    gameStatus === "won" || gameStatus === "game_over"
      ? calcScore(capturedCount, totalClicks, elapsedSeconds, allCaptured)
      : { base: 0, speedMultiplier: 1, clickBonus: 0, total: 0 };

  // Save best on win
  useEffect(() => {
    if (gameStatus === "won") {
      const s = calcScore(
        PARTICLE_COUNT,
        totalClicks,
        Math.floor((Date.now() - startTimeRef.current) / 1000),
        true
      );
      saveBest(s.total);
      bestRef.current = Math.max(bestRef.current, s.total);
    }
  }, [gameStatus, totalClicks]);

  // ---------------------------------------------------------------------------
  // Particle ref callback
  // ---------------------------------------------------------------------------

  const setParticleRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) {
        particleElementsRef.current.set(id, el);
        const p = particlesRef.current.find((pp) => pp.id === id);
        if (p) {
          el.style.transform = `translate(${p.x - PARTICLE_SIZE / 2}px, ${p.y - PARTICLE_SIZE / 2}px)`;
        }
      } else {
        particleElementsRef.current.delete(id);
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const particles = particlesRef.current;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "monospace",
        color: "#fff",
      }}
    >
      {/* HUD */}
      {gameStatus === "playing" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 12,
            fontSize: 14,
            color: "#ccc",
          }}
        >
          <span>
            Score: <strong style={{ color: colors.secondary }}>{score}</strong>
          </span>
          <span>
            Time:{" "}
            <strong style={{ color: timeLeft <= 10 ? "#ef4444" : colors.secondary }}>
              {timeLeft}s
            </strong>
          </span>
          <span>
            Remaining:{" "}
            <strong style={{ color: colors.accent }}>
              {PARTICLE_COUNT - capturedCount}
            </strong>
          </span>
          <span>
            Clicks: <strong style={{ color: "#9ca3af" }}>{totalClicks}</strong>
          </span>
        </div>
      )}

      {/* Play Area */}
      <div
        ref={playAreaRef}
        onClick={handlePlayAreaClick}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: PLAY_WIDTH,
          height: PLAY_HEIGHT,
          background: colors.bg,
          border: `1px solid rgba(${colors.secondaryRgb}, 0.2)`,
          borderRadius: 8,
          overflow: "hidden",
          cursor: gameStatus === "playing" ? "crosshair" : "default",
          userSelect: "none",
        }}
      >
        {/* Particles */}
        {particles.map((p) => {
          if (p.captured) return null;
          const isCapturing = capturingIds.has(p.id);
          const pColor = getParticleColor(p);

          return (
            <div
              key={p.id}
              ref={setParticleRef(p.id)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PARTICLE_SIZE,
                height: PARTICLE_SIZE,
                borderRadius: "50%",
                background: pColor,
                boxShadow: `0 0 6px ${pColor}, 0 0 12px ${pColor}40`,
                pointerEvents: "none",
                transition: isCapturing
                  ? "transform 0.15s ease-in, opacity 0.3s ease-in"
                  : "none",
                animation: isCapturing
                  ? "gravityCapture 0.3s ease-in forwards"
                  : "none",
              }}
            />
          );
        })}

        {/* Gravity Wells */}
        <AnimatePresence>
          {wells.map((well) => (
            <motion.div
              key={well.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: well.x,
                top: well.y,
                width: WELL_RADIUS * 2,
                height: WELL_RADIUS * 2,
                marginLeft: -WELL_RADIUS,
                marginTop: -WELL_RADIUS,
                borderRadius: "50%",
                border: `2px solid ${colors.accent}`,
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Well inner pulse */}
        <AnimatePresence>
          {wells.map((well) => (
            <motion.div
              key={`inner-${well.id}`}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{
                scale: [0, 0.8, 0.4, 0.8],
                opacity: [0.6, 0.3, 0.6, 0],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: well.x,
                top: well.y,
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${colors.accentRgb}, 0.38) 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>

        {/* IDLE overlay */}
        <AnimatePresence>
          {gameStatus === "idle" && (
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
                background: `rgba(${colors.bgRgb}, 0.8)`,
                zIndex: 10,
              }}
            >
              <h2
                style={{
                  fontSize: 28,
                  color: colors.secondary,
                  marginBottom: 8,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                Gravity Pulse
              </h2>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  marginBottom: 24,
                  textAlign: "center",
                  maxWidth: 300,
                  lineHeight: 1.5,
                  fontFamily: "monospace",
                }}
              >
                Click to create gravity wells. Pull in all particles before time
                runs out!
              </p>
              <button
                onClick={handleStart}
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
                Click Start
              </button>
              {bestRef.current > 0 && (
                <p
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    marginTop: 12,
                    fontFamily: "monospace",
                  }}
                >
                  Best: {bestRef.current}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* WON overlay */}
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
                <h2
                  style={{
                    fontSize: 28,
                    color: colors.secondary,
                    marginBottom: 16,
                    fontWeight: 700,
                  }}
                >
                  All Captured!
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    justifyContent: "center",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#9ca3af",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: colors.secondary,
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      {finalScore.base}
                    </div>
                    <div>Base</div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: colors.accent,
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      x{finalScore.speedMultiplier}
                    </div>
                    <div>Speed</div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: colors.accent,
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      +{finalScore.clickBonus}
                    </div>
                    <div>Efficiency</div>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: colors.secondary,
                    marginBottom: 8,
                  }}
                >
                  {finalScore.total}
                </motion.div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
                  Total Score
                </div>

                {finalScore.total >= bestRef.current && (
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
                      padding: "4px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      marginBottom: 16,
                    }}
                  >
                    New Personal Best!
                  </motion.div>
                )}

                <div>
                  <button
                    onClick={handleStart}
                    style={{
                      background: colors.secondary,
                      border: "none",
                      color: colors.bg,
                      padding: "10px 28px",
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 14,
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

        {/* GAME OVER overlay */}
        <AnimatePresence>
          {gameStatus === "game_over" && (
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
                <h2
                  style={{
                    fontSize: 28,
                    color: "#ef4444",
                    marginBottom: 16,
                    fontWeight: 700,
                  }}
                >
                  Time Up!
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
                    <div
                      style={{
                        color: colors.secondary,
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {capturedCount}/{PARTICLE_COUNT}
                    </div>
                    <div>Captured</div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: colors.secondary,
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {capturedCount * 10}
                    </div>
                    <div>Score</div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleStart}
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
                      e.currentTarget.style.background =
                        `rgba(${colors.secondaryRgb}, 0.15)`;
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Capture animation keyframes */}
      <style>{`
        @keyframes gravityCapture {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
