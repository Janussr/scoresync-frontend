"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

type PlayingCard = {
  suit: Suit;
  rank: Rank;
  value: number;
  id: string;
};

type RoundResult = "Player wins" | "Dealer wins" | "Push" | null;

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = 0;

      if (rank === "A") value = 11;
      else if (["J", "Q", "K"].includes(rank)) value = 10;
      else value = Number(rank);

      deck.push({
        suit,
        rank,
        value,
        id: `${rank}-${suit}-${Math.random().toString(36).slice(2, 9)}`,
      });
    }
  }

  return shuffle(deck);
}

function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getHandValue(cards: PlayingCard[]) {
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter((c) => c.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function isBlackjack(cards: PlayingCard[]) {
  return cards.length === 2 && getHandValue(cards) === 21;
}

function isRedSuit(suit: Suit) {
  return suit === "♥" || suit === "♦";
}

function drawOne(deck: PlayingCard[]) {
  const nextDeck = [...deck];
  const card = nextDeck.shift();

  if (!card) {
    const rebuilt = createDeck();
    return {
      card: rebuilt[0],
      deck: rebuilt.slice(1),
    };
  }

  return { card, deck: nextDeck };
}

function getVisibleDealerValue(cards: PlayingCard[], revealDealer: boolean) {
  if (revealDealer) return getHandValue(cards);
  if (cards.length === 0) return 0;
  return getHandValue([cards[0]]);
}

function PlayingCardView({
  card,
  hidden = false,
}: {
  card?: PlayingCard;
  hidden?: boolean;
}) {
  if (hidden || !card) {
    return (
      <Box
        sx={{
          width: { xs: 54, sm: 78 },
          height: { xs: 78, sm: 112 },
          borderRadius: 1,
          border: "1px solid rgba(212,175,55,0.24)",
          background:
            "linear-gradient(135deg, rgba(20,40,80,1), rgba(8,20,42,1))",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 20px rgba(0,0,0,0.28)",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 6,
            borderRadius: 1,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 8px, rgba(255,255,255,0.02) 8px 16px)",
          }}
        />
      </Box>
    );
  }

  const red = isRedSuit(card.suit);

  return (
    <Box
      sx={{
        width: { xs: 54, sm: 78 },
        height: { xs: 78, sm: 112 },
        borderRadius: 1,
        border: "1px solid rgba(212,175,55,0.24)",
        bgcolor: "#fffdf8",
        color: red ? "#b71c1c" : "#111",
        position: "relative",
        boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
        flexShrink: 0,
      }}
    >
      <Box sx={{ position: "absolute", top: 6, left: 7, lineHeight: 1 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: { xs: "0.8rem", sm: "1rem" } }}
        >
          {card.rank}
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.78rem", sm: "1rem" } }}>
          {card.suit}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography
          sx={{ fontSize: { xs: "1.45rem", sm: "2.1rem" }, fontWeight: 700 }}
        >
          {card.suit}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 6,
          right: 7,
          lineHeight: 1,
          transform: "rotate(180deg)",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{ fontWeight: 800, fontSize: { xs: "0.8rem", sm: "1rem" } }}
        >
          {card.rank}
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.78rem", sm: "1rem" } }}>
          {card.suit}
        </Typography>
      </Box>
    </Box>
  );
}

function HandSection({
  title,
  value,
  cards,
  revealDealer = true,
  highlight = false,
}: {
  title: string;
  value: string | number;
  cards: PlayingCard[];
  revealDealer?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: highlight
          ? "1px solid rgba(245,230,168,0.7)"
          : "1px solid rgba(212,175,55,0.18)",
        background:
          "linear-gradient(180deg, rgba(13,36,18,0.96), rgba(7,26,12,0.98))",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.25, sm: 1.75 },
          "&:last-child": { pb: { xs: 1.25, sm: 1.75 } },
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              {title}
            </Typography>

            <Chip
              label={`Value: ${value}`}
              size="small"
              sx={{
                fontWeight: 700,
                color: "#f5e6a8",
                border: "1px solid rgba(212,175,55,0.22)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            />
          </Stack>

          <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
            {cards.map((card, index) => (
              <PlayingCardView
                key={card.id}
                card={card}
                hidden={!revealDealer && index === 1}
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BlackJackFunPage() {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [roundActive, setRoundActive] = useState(false);
  const [revealDealer, setRevealDealer] = useState(false);
  const [status, setStatus] = useState("Press Deal to start a round.");
  const [result, setResult] = useState<RoundResult>(null);
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    pushes: 0,
    rounds: 0,
  });
  const [history, setHistory] = useState<string[]>([]);

  const playerValue = useMemo(() => getHandValue(playerCards), [playerCards]);
  const dealerValue = useMemo(
    () => getVisibleDealerValue(dealerCards, revealDealer),
    [dealerCards, revealDealer]
  );

  const commitResult = (
    nextResult: Exclude<RoundResult, null>,
    nextStatus: string
  ) => {
    setResult(nextResult);
    setStatus(nextStatus);
    setRoundActive(false);
    setRevealDealer(true);

    setStats((prev) => ({
      rounds: prev.rounds + 1,
      wins: prev.wins + (nextResult === "Player wins" ? 1 : 0),
      losses: prev.losses + (nextResult === "Dealer wins" ? 1 : 0),
      pushes: prev.pushes + (nextResult === "Push" ? 1 : 0),
    }));

    setHistory((prev) => [nextResult, ...prev].slice(0, 8));
  };

  const dealRound = () => {
    const freshDeck = createDeck();

    const d1 = drawOne(freshDeck);
    const p1 = drawOne(d1.deck);
    const d2 = drawOne(p1.deck);
    const p2 = drawOne(d2.deck);

    const nextDealerCards = [d1.card, d2.card];
    const nextPlayerCards = [p1.card, p2.card];

    setDeck(p2.deck);
    setDealerCards(nextDealerCards);
    setPlayerCards(nextPlayerCards);
    setRoundActive(true);
    setRevealDealer(false);
    setResult(null);

    const playerBJ = isBlackjack(nextPlayerCards);
    const dealerBJ = isBlackjack(nextDealerCards);

    if (playerBJ && dealerBJ) {
      setRevealDealer(true);
      commitResult("Push", "Both have blackjack. Push.");
      return;
    }

    if (playerBJ) {
      setRevealDealer(true);
      commitResult("Player wins", "Blackjack! You win.");
      return;
    }

    if (dealerBJ) {
      setRevealDealer(true);
      commitResult("Dealer wins", "Dealer has blackjack.");
      return;
    }

    setStatus("Your move. Hit or Stand.");
  };

  const hit = () => {
    if (!roundActive) return;

    const draw = drawOne(deck);
    const nextPlayerCards = [...playerCards, draw.card];
    const nextValue = getHandValue(nextPlayerCards);

    setDeck(draw.deck);
    setPlayerCards(nextPlayerCards);

    if (nextValue > 21) {
      setRevealDealer(true);
      commitResult("Dealer wins", `Bust with ${nextValue}. Dealer wins.`);
      return;
    }

    if (nextValue === 21) {
      setStatus("21. You can stand.");
      return;
    }

    setStatus("Hit or Stand.");
  };

  const stand = () => {
    if (!roundActive) return;

    setRevealDealer(true);

    let nextDeck = [...deck];
    let nextDealerCards = [...dealerCards];
    let nextDealerValue = getHandValue(nextDealerCards);

    while (nextDealerValue < 17) {
      const draw = drawOne(nextDeck);
      nextDealerCards = [...nextDealerCards, draw.card];
      nextDeck = draw.deck;
      nextDealerValue = getHandValue(nextDealerCards);
    }

    setDeck(nextDeck);
    setDealerCards(nextDealerCards);

    if (nextDealerValue > 21) {
      commitResult(
        "Player wins",
        `Dealer busts with ${nextDealerValue}. You win.`
      );
      return;
    }

    const finalPlayer = getHandValue(playerCards);

    if (finalPlayer > nextDealerValue) {
      commitResult(
        "Player wins",
        `You win ${finalPlayer} to ${nextDealerValue}.`
      );
      return;
    }

    if (finalPlayer < nextDealerValue) {
      commitResult(
        "Dealer wins",
        `Dealer wins ${nextDealerValue} to ${finalPlayer}.`
      );
      return;
    }

    commitResult("Push", `Push at ${finalPlayer}.`);
  };

  const resetTable = () => {
    setDeck([]);
    setPlayerCards([]);
    setDealerCards([]);
    setRoundActive(false);
    setRevealDealer(false);
    setStatus("Press Deal to start a round.");
    setResult(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1180,
        mx: "auto",
        mt: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "text.secondary",
              fontSize: "0.7rem",
              mb: 0.5,
            }}
          >
            Just for fun
          </Typography>

          <Typography
            variant="h3"
            sx={{ mb: 0.5, fontSize: { xs: "1.7rem", sm: "2.6rem" } }}
          >
            Blackjack Table
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent
            sx={{
              p: { xs: 1.25, md: 3 },
              "&:last-child": { pb: { xs: 1.25, md: 3 } },
            }}
          >
            <Stack spacing={{ xs: 1.25, sm: 2 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  p: { xs: 1.1, sm: 2 },
                  background:
                    "radial-gradient(circle at top, rgba(26,92,46,0.95), rgba(10,39,20,1) 70%)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  boxShadow: "inset 0 0 0 1px rgba(245,230,168,0.05)",
                }}
              >
                <Stack spacing={{ xs: 1.1, sm: 2 }}>
                  <HandSection
                    title="Dealer"
                    value={dealerCards.length ? dealerValue : "—"}
                    cards={dealerCards}
                    revealDealer={revealDealer}
                    highlight={result === "Dealer wins"}
                  />

                  <Divider sx={{ borderColor: "rgba(212,175,55,0.16)" }} />

                  <HandSection
                    title="Player"
                    value={playerCards.length ? playerValue : "—"}
                    cards={playerCards}
                    revealDealer
                    highlight={result === "Player wins"}
                  />
                </Stack>
              </Box>

              <Card
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(212,175,55,0.18)",
                  background:
                    "linear-gradient(180deg, rgba(19,52,27,0.9), rgba(8,27,13,0.96))",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.25, sm: 2 },
                    "&:last-child": { pb: { xs: 1.25, sm: 2 } },
                  }}
                >
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 1, sm: 2 }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            mb: 0.4,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          Table status
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.98rem", sm: "1.1rem" },
                          }}
                        >
                          {status}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            mb: 0.4,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          Last result
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "0.98rem", sm: "1.1rem" },
                            color:
                              result === "Player wins"
                                ? "success.main"
                                : result === "Dealer wins"
                                ? "error.main"
                                : "text.primary",
                          }}
                        >
                          {result ?? "—"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                    >
                      <Button
                        variant="contained"
                        onClick={dealRound}
                        disabled={roundActive}
                        fullWidth
                        sx={{ py: 1.05 }}
                      >
                        Deal
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={hit}
                        disabled={!roundActive}
                        fullWidth
                        sx={{ py: 1.05 }}
                      >
                        Hit
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={stand}
                        disabled={!roundActive}
                        fullWidth
                        sx={{ py: 1.05 }}
                      >
                        Stand
                      </Button>

                      <Button
                        variant="text"
                        onClick={resetTable}
                        disabled={roundActive}
                        fullWidth
                        sx={{ py: 1.05 }}
                      >
                        New round
                      </Button>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={{ xs: 1.25, sm: 2 }}
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip label={`Rounds ${stats.rounds}`} size="small" />
                        <Chip
                          label={`Wins ${stats.wins}`}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`Losses ${stats.losses}`}
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`Pushes ${stats.pushes}`}
                          variant="outlined"
                          size="small"
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                      >
                        {history.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No rounds yet.
                          </Typography>
                        ) : (
                          history.map((item, index) => (
                            <Chip
                              key={`${item}-${index}`}
                              label={item}
                              size="small"
                              sx={{
                                color: "#f5e6a8",
                                border: "1px solid rgba(212,175,55,0.22)",
                                backgroundColor: "rgba(255,255,255,0.05)",
                              }}
                            />
                          ))
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}