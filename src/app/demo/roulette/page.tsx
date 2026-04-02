"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

const EUROPEAN_ROULETTE_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const WHEEL_SIZE = 420;
const CENTER = WHEEL_SIZE / 2;
const OUTER_RADIUS = 190;
const INNER_RADIUS = 118;
const BALL_TRACK_RADIUS = 202;
const POCKET_DROP_RADIUS = 187;
const NUMBER_RING_TEXT_RADIUS = 155;
const TOTAL_SEGMENTS = EUROPEAN_ROULETTE_ORDER.length;
const SEGMENT_ANGLE = 360 / TOTAL_SEGMENTS;

const MAIN_SPIN_DURATION_MS = 4000;
const SETTLING_DURATION_MS = 1300;
const TOTAL_SPIN_DURATION_MS = MAIN_SPIN_DURATION_MS + SETTLING_DURATION_MS;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeArcSegment(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function getPocketColor(value: number) {
  if (value === 0) return "#2e7d32";
  return RED_NUMBERS.has(value) ? "#b71c1c" : "#161616";
}

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

function getWinningIndexFromAngles(wheelAngle: number, ballAngle: number) {
  const relativeAngle = normalizeRotation(ballAngle - wheelAngle -1.1);
  return (
    Math.floor((relativeAngle + SEGMENT_ANGLE / 2) / SEGMENT_ANGLE) %
    TOTAL_SEGMENTS
  );
}

function getColumn(number: number) {
  if (number === 0) return null;
  return ((number - 1) % 3) + 1;
}

function getDozen(number: number) {
  if (number === 0) return null;
  if (number <= 12) return 1;
  if (number <= 24) return 2;
  return 3;
}

function getEvenOdd(number: number) {
  if (number === 0) return null;
  return number % 2 === 0 ? "Even" : "Odd";
}

function getHighLow(number: number) {
  if (number === 0) return null;
  return number <= 18 ? "1-18" : "19-36";
}

function getBetHits(number: number) {
  return {
    straight: number,
    color: number === 0 ? null : RED_NUMBERS.has(number) ? "Red" : "Black",
    evenOdd: getEvenOdd(number),
    highLow: getHighLow(number),
    dozen: getDozen(number),
    column: getColumn(number),
  };
}

export default function RouletteFunWheel() {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [ballTrackRadius, setBallTrackRadius] = useState(BALL_TRACK_RADIUS);
  const [ballVisualJitter, setBallVisualJitter] = useState(0);
  const [ballSize, setBallSize] = useState(7);

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [spinCount, setSpinCount] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (settleIntervalRef.current) clearInterval(settleIntervalRef.current);
    };
  }, []);

  const segments = useMemo(() => {
    return EUROPEAN_ROULETTE_ORDER.map((value, index) => {
      const startAngle = index * SEGMENT_ANGLE;
      const endAngle = startAngle + SEGMENT_ANGLE;
      const midAngle = startAngle + SEGMENT_ANGLE / 2;
      const textPos = polarToCartesian(
        CENTER,
        CENTER,
        NUMBER_RING_TEXT_RADIUS,
        midAngle
      );

      return {
        value,
        index,
        midAngle,
        path: describeArcSegment(
          CENTER,
          CENTER,
          OUTER_RADIUS,
          INNER_RADIUS,
          startAngle,
          endAngle
        ),
        textX: textPos.x,
        textY: textPos.y,
      };
    });
  }, []);

  const lastFive = history.slice(0, 5);
  const hits = result === null ? null : getBetHits(result);

  const effectiveBallAngle = ballRotation + ballVisualJitter;
  const ballPos = polarToCartesian(CENTER, CENTER, ballTrackRadius, 0);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (settleIntervalRef.current) clearInterval(settleIntervalRef.current);
    timeoutRef.current = null;
    settleIntervalRef.current = null;
  };

  const spinWheel = () => {
    if (isSpinning) return;

    clearTimers();

    setIsSpinning(true);
    setResult(null);
    setSpinCount((prev) => prev + 1);
    setBallTrackRadius(BALL_TRACK_RADIUS);
    setBallVisualJitter(0);
    setBallSize(6.6);

    const wheelExtraSpins = 5 + Math.random() * 1.5;
    const ballExtraSpins = 8 + Math.random() * 2.5;

    const randomWheelStop = Math.random() * 360;
    const randomBallStop = Math.random() * 360;

    const nextWheelRotation =
      wheelRotation + wheelExtraSpins * 360 + randomWheelStop;

    const mainBallRotation =
      ballRotation - ballExtraSpins * 360 - randomBallStop;

    setWheelRotation(nextWheelRotation);
    setBallRotation(mainBallRotation);

    timeoutRef.current = setTimeout(() => {
      const settleSteps = 10 + Math.floor(Math.random() * 4);
      const jitterSequence: number[] = [];
      const radiusSequence: number[] = [];

      for (let i = 0; i < settleSteps; i++) {
        const progress = i / Math.max(1, settleSteps - 1);
        const damping = 1 - progress;

        const direction = i % 2 === 0 ? 1 : -1;
        const angularJitter = direction * (2.8 * damping + 0.25);
        jitterSequence.push(angularJitter);

        const radiusDrop =
          BALL_TRACK_RADIUS -
          (BALL_TRACK_RADIUS - POCKET_DROP_RADIUS) * Math.pow(progress, 0.82);

        const bounce =
          Math.sin(progress * Math.PI * 3.2) * (2.8 * damping);

        radiusSequence.push(radiusDrop + bounce);
      }

      jitterSequence.push(0);
      radiusSequence.push(POCKET_DROP_RADIUS);

      let stepIndex = 0;
      const baseFinalBallRotation = mainBallRotation;
      const stepDuration = Math.max(
        70,
        Math.floor(SETTLING_DURATION_MS / jitterSequence.length)
      );

      settleIntervalRef.current = setInterval(() => {
        const currentJitter = jitterSequence[stepIndex] ?? 0;
        const currentRadius = radiusSequence[stepIndex] ?? POCKET_DROP_RADIUS;
        const progress = stepIndex / Math.max(1, jitterSequence.length - 1);

        setBallVisualJitter(currentJitter);
        setBallTrackRadius(currentRadius);
        setBallSize(6.5 - progress * 0.9);

        stepIndex += 1;

        if (stepIndex >= jitterSequence.length) {
          if (settleIntervalRef.current) {
            clearInterval(settleIntervalRef.current);
            settleIntervalRef.current = null;
          }

          setBallVisualJitter(0);
          setBallTrackRadius(POCKET_DROP_RADIUS);
          setBallSize(5.7);
          setBallRotation(baseFinalBallRotation);

          const finalWheel = normalizeRotation(nextWheelRotation);
          const finalBall = normalizeRotation(baseFinalBallRotation);
          const winningIndex = getWinningIndexFromAngles(finalWheel, finalBall);
          const winningNumber = EUROPEAN_ROULETTE_ORDER[winningIndex];

          setResult(winningNumber);
          setHistory((prev) => [winningNumber, ...prev].slice(0, 10));
          setIsSpinning(false);
        }
      }, stepDuration);
    }, MAIN_SPIN_DURATION_MS);
  };

  const resetHistory = () => {
    if (isSpinning) return;

    clearTimers();
    setHistory([]);
    setResult(null);
    setSpinCount(0);
    setWheelRotation(0);
    setBallRotation(0);
    setBallTrackRadius(BALL_TRACK_RADIUS);
    setBallVisualJitter(0);
    setBallSize(7);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1240,
        mx: "auto",
        mt: 4,
        px: { xs: 1.25, sm: 2 },
      }}
    >
      <Stack spacing={2.5}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "text.secondary",
              fontSize: "0.75rem",
              mb: 1,
            }}
          >
            Just for fun
          </Typography>

          <Typography
            variant="h3"
            sx={{
              mb: 1,
              fontSize: { xs: "2rem", sm: "2.6rem" },
            }}
          >
            Roulette Wheel
          </Typography>

          <Typography color="text.secondary" sx={{ px: { xs: 1, sm: 0 } }}>
            Spin the wheel, watch the ball race around the rim, and see what the
            board would have hit.
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
          <CardContent
            sx={{
              p: { xs: 1.5, md: 3 },
              "&:last-child": { pb: { xs: 1.5, md: 3 } },
            }}
          >
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={{ xs: 2, md: 3 }}
              alignItems="stretch"
            >
              <Stack
                spacing={3}
                sx={{
                  flex: { xs: "1 1 auto", xl: "0 0 520px" },
                  width: "100%",
                  maxWidth: { xs: "100%", xl: 520 },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: { xs: 300, sm: 380, md: 470 },
                    mx: "auto",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      overflow: "visible",
                      background:
                        "radial-gradient(circle at center, rgba(212,175,55,0.18), rgba(0,0,0,0) 62%)",
                    }}
                  >
                    <svg
                      viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                      width="100%"
                      height="100%"
                      style={{
                        display: "block",
                        filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.35))",
                      }}
                    >
                      <g
                        style={{
                          transition: isSpinning
                            ? `transform ${TOTAL_SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.8, 0.18, 1)`
                            : "transform 0.3s ease-out",
                          transformOrigin: `${CENTER}px ${CENTER}px`,
                          transform: `rotate(${wheelRotation}deg)`,
                        }}
                      >
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={BALL_TRACK_RADIUS + 4}
                          fill="#5b4010"
                          stroke="#d4af37"
                          strokeWidth="4"
                        />
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={BALL_TRACK_RADIUS - 7}
                          fill="#2e1708"
                          stroke="rgba(245,230,168,0.15)"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={OUTER_RADIUS + 12}
                          fill="#5b4010"
                          stroke="#d4af37"
                          strokeWidth="3"
                        />

                        {segments.map((segment) => (
                          <g key={segment.value}>
                            <path
                              d={segment.path}
                              fill={getPocketColor(segment.value)}
                              stroke="#d8c37a"
                              strokeWidth="1.2"
                            />
                            <text
                              x={segment.textX}
                              y={segment.textY}
                              fill="#f5e6a8"
                              fontSize="15"
                              fontWeight="700"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${segment.midAngle + 90} ${segment.textX} ${segment.textY})`}
                              style={{ userSelect: "none" }}
                            >
                              {segment.value}
                            </text>
                          </g>
                        ))}

                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={106}
                          fill="#0d2412"
                          stroke="#d4af37"
                          strokeWidth="3"
                        />
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={75}
                          fill="#13341b"
                          stroke="rgba(212,175,55,0.35)"
                          strokeWidth="2"
                        />
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={22}
                          fill="#d4af37"
                          stroke="#f5e6a8"
                          strokeWidth="2"
                        />
                      </g>

                      <g
                        style={{
                          transition: isSpinning
                            ? `transform ${MAIN_SPIN_DURATION_MS}ms cubic-bezier(0.08, 0.82, 0.16, 1)`
                            : "transform 0.2s ease-out",
                          transformOrigin: `${CENTER}px ${CENTER}px`,
                          transform: `rotate(${effectiveBallAngle}deg)`,
                        }}
                      >
                        <ellipse
                          cx={ballPos.x}
                          cy={ballPos.y + 4}
                          rx={ballSize * 0.9}
                          ry={ballSize * 0.45}
                          fill="rgba(0,0,0,0.22)"
                        />
                        <circle
                          cx={ballPos.x}
                          cy={ballPos.y}
                          r={ballSize}
                          fill="url(#ballGradient)"
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth="1.25"
                        />
                      </g>

                      <defs>
                        <radialGradient
                          id="ballGradient"
                          cx="35%"
                          cy="35%"
                          r="70%"
                        >
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="45%" stopColor="#f5f5f5" />
                          <stop offset="70%" stopColor="#c9c9c9" />
                          <stop offset="100%" stopColor="#8a8a8a" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </Box>
                </Box>

                <Card
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(212,175,55,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(19,52,27,0.9), rgba(8,27,13,0.96))",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography sx={{ color: "text.secondary", mb: 0.5 }}>
                          Status
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
                          {isSpinning ? "Spinning..." : "Ready to spin"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: "text.secondary", mb: 0.5 }}>
                          Last result
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            lineHeight: 1,
                            color:
                              result === null
                                ? "text.primary"
                                : result === 0
                                ? "success.main"
                                : RED_NUMBERS.has(result)
                                ? "error.main"
                                : "text.primary",
                          }}
                        >
                          {result ?? "—"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: "text.secondary", mb: 0.5 }}>
                          Total spins
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
                          {spinCount}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={spinWheel}
                        disabled={isSpinning}
                        fullWidth
                        sx={{ py: 1.2 }}
                      >
                        {isSpinning ? "Spinning" : "Spin"}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={resetHistory}
                        disabled={isSpinning}
                        sx={{ px: 2.2 }}
                      >
                        Reset
                      </Button>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ color: "text.secondary", mb: 1 }}>
                        Last spins
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {lastFive.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No spins yet.
                          </Typography>
                        )}

                        {lastFive.map((value, index) => (
                          <Chip
                            key={`${value}-${index}`}
                            label={value}
                            sx={{
                              minWidth: 48,
                              fontWeight: 700,
                              color: "#f5e6a8",
                              border: "1px solid rgba(212,175,55,0.22)",
                              backgroundColor:
                                value === 0
                                  ? "rgba(46,125,50,0.28)"
                                  : RED_NUMBERS.has(value)
                                  ? "rgba(183,28,28,0.28)"
                                  : "rgba(255,255,255,0.06)",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(212,175,55,0.18)",
                    background:
                      "linear-gradient(180deg, rgba(13,36,18,0.95), rgba(7,26,12,0.98))",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography sx={{ color: "text.secondary", mb: 1 }}>
                      Board readout
                    </Typography>

                    {result === null ? (
                      <Typography color="text.secondary">
                        Spin the wheel to see which straight, color, dozen,
                        column, and outside bets would have landed.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        <Typography>
                          Winning number:{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {result}
                          </Box>
                        </Typography>
                        <Typography>
                          Color:{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {hits?.color ?? "Green"}
                          </Box>
                        </Typography>
                        <Typography>
                          Outside:{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {hits?.highLow ?? "—"}
                          </Box>{" "}
                          ·{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {hits?.evenOdd ?? "—"}
                          </Box>
                        </Typography>
                        <Typography>
                          Dozen:{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {hits?.dozen
                              ? `${hits.dozen}${
                                  hits.dozen === 1
                                    ? "st"
                                    : hits.dozen === 2
                                    ? "nd"
                                    : "rd"
                                } 12`
                              : "—"}
                          </Box>
                        </Typography>
                        <Typography>
                          Column:{" "}
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {hits?.column
                              ? `${hits.column}${
                                  hits.column === 1
                                    ? "st"
                                    : hits.column === 2
                                    ? "nd"
                                    : "rd"
                                } column`
                              : "—"}
                          </Box>
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}