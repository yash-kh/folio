import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "../ui/tooltip";
import StackMatchGame from "../games/stack-match-game";
import BugSquash from "../games/bug-squash";
import DebugRush from "../games/debug-rush";
import DebugGrid from "../games/debug-grid";
import GravityPulse from "../games/gravity-pulse";
import { useColorTheme } from "../ui/color-theme-provider";

const GAMES = [
  { name: "Stack Match", component: StackMatchGame },
  { name: "Bug Squash", component: BugSquash },
  { name: "Debug Rush", component: DebugRush },
  { name: "Debug Grid", component: DebugGrid },
  { name: "Gravity Pulse", component: GravityPulse },
] as const;

function StackMatch() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { colors } = useColorTheme();

  const ActiveGame = GAMES[activeIndex].component;

  return (
    <div className="container pt-4 relative pb-20" id="stack-match">
      {/* Section header */}
      <div className="text-center">
        <div className="inline-block header-group py-5 px-10 m-10">
          <Tooltip message="Take a break!">
            <div className="text-5xl">Play</div>
          </Tooltip>
        </div>
      </div>

      {/* Game selector pills */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            padding: "4px 0",
            maxWidth: "100%",
          }}
        >
          {GAMES.map((game, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={game.name}
                onClick={() => setActiveIndex(index)}
                style={{
                  background: isActive ? "var(--folio-accent)" : "transparent",
                  color: isActive ? "#000" : "#fff",
                  border: isActive ? "2px solid var(--folio-accent)" : `2px solid rgba(${colors.accentRgb}, 0.3)`,
                  padding: "8px 20px",
                  borderRadius: 9999,
                  fontFamily: "monospace",
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = `rgba(${colors.accentRgb}, 0.6)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = `rgba(${colors.accentRgb}, 0.3)`;
                  }
                }}
              >
                {game.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active game display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={GAMES[activeIndex].name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ActiveGame />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default StackMatch;
