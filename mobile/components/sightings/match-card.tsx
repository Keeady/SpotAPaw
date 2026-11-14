import { Match } from "@/db/repositories/base-sighting-repository";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { toPercent } from "./util";
import { RenderSightingProfile } from "../pet-profile";

type Props = {
  match: Match;
  onSelect?: () => void;
};

const STRONG_MATCH_THRESHOLD = 90;
const STRONG_MATCH_BG = "#4caf50";
const WEAK_MATCH_BG = "#c7ebc8";

export function MatchCard({ match, onSelect }: Props) {
  const theme = useTheme();

  const sighting = match.sighting;
  const pct = toPercent(match.score);

  if (!sighting) return null;

  const isStrong = pct !== null && pct >= STRONG_MATCH_THRESHOLD;

  return (
    <View style={styles.container}>
      <RenderSightingProfile pet={sighting} onSelect={onSelect} />
      {pct !== null && (
        <Chip
          compact
          style={[
            styles.badge,
            { backgroundColor: isStrong ? STRONG_MATCH_BG : WEAK_MATCH_BG },
          ]}
          textStyle={[
            styles.badgeText,
            {
              color: isStrong ? "#ffffff" : theme.dark ? "#171717" : "#171717",
            },
          ]}
          accessibilityLabel={`${pct}% match`}
        >
          {pct}%
        </Chip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 999,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
