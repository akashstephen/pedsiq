/**
 * useFeatureWarsEngine v2 — Refactored with proper cumulative stats and cleanup
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { type FeatureWarsBattle, type FeatureWarsFeature } from '@/types/arcade';

export function useFeatureWarsEngine(allBattles: FeatureWarsBattle[]) {
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, Set<string>>>({});
  const [feedback, setFeedback] = useState<{type:'ok'|'partial'|'bad', feature:FeatureWarsFeature, diseaseName?:string} | null>(null);
  const [lastWrongChipId, setLastWrongChipId] = useState<string | null>(null);
  const [alreadyPlacedColumnId, setAlreadyPlacedColumnId] = useState<string | null>(null);

  // Per-battle stats (reset each battle)
  const [battleCorrectCount, setBattleCorrectCount] = useState(0);
  const [battleWrongCount, setBattleWrongCount] = useState(0);
  const [battleMultiFound, setBattleMultiFound] = useState(0);
  const [battleMissedFeatures, setBattleMissedFeatures] = useState<FeatureWarsFeature[]>([]);

  // Cumulative stats (across all battles)
  const [totalCorrectCount, setTotalCorrectCount] = useState(0);
  const [totalWrongCount, setTotalWrongCount] = useState(0);
  const [totalMultiFound, setTotalMultiFound] = useState(0);
  const [allMissedFeatures, setAllMissedFeatures] = useState<FeatureWarsFeature[]>([]);

  const alreadyPlacedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const battleCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const battle = allBattles[currentBattleIndex];

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (alreadyPlacedTimeoutRef.current) clearTimeout(alreadyPlacedTimeoutRef.current);
      if (battleCompleteTimeoutRef.current) clearTimeout(battleCompleteTimeoutRef.current);
    };
  }, []);

  const initBattle = useCallback((index: number) => {
    const b = allBattles[index];
    const newPlacements: Record<string, Set<string>> = {};
    b.features.forEach((f) => { newPlacements[f.id] = new Set(); });
    setPlacements(newPlacements);
    setSelectedFeatureId(null);
    setBattleCorrectCount(0);
    setBattleWrongCount(0);
    setBattleMultiFound(0);
    setBattleMissedFeatures([]);
    setFeedback(null);
    setLastWrongChipId(null);
    setAlreadyPlacedColumnId(null);
  }, [allBattles]);

  const initGame = useCallback(() => {
    setCurrentBattleIndex(0);
    setScore(0);
    setTotalCorrectCount(0);
    setTotalWrongCount(0);
    setTotalMultiFound(0);
    setAllMissedFeatures([]);
    initBattle(0);
  }, [initBattle]);

  const isFeatureDone = useCallback((featureId: string): boolean => {
    const f = battle?.features.find((x) => x.id === featureId);
    if (!f) return false;
    return f.correctDiseaseIds.every((id) => placements[featureId]?.has(id));
  }, [battle, placements]);

  const onChipTap = useCallback((featureId: string) => {
    if (isFeatureDone(featureId)) return;
    setLastWrongChipId(null);
    setSelectedFeatureId((prev) => (prev === featureId ? null : featureId));
  }, [isFeatureDone]);

  const onColumnTap = useCallback((diseaseId: string) => {
    setSelectedFeatureId((currentSelectedId) => {
      if (!currentSelectedId) return currentSelectedId;
      const feature = battle?.features.find((f) => f.id === currentSelectedId);
      if (!feature) return currentSelectedId;

      // Check if already placed
      if (placements[currentSelectedId]?.has(diseaseId)) {
        setAlreadyPlacedColumnId(diseaseId);
        if (alreadyPlacedTimeoutRef.current) clearTimeout(alreadyPlacedTimeoutRef.current);
        alreadyPlacedTimeoutRef.current = setTimeout(() => setAlreadyPlacedColumnId(null), 400);
        return currentSelectedId;
      }

      const isCorrect = feature.correctDiseaseIds.includes(diseaseId);

      if (isCorrect) {
        const newPlacements = { ...placements, [currentSelectedId]: new Set(placements[currentSelectedId]) };
        newPlacements[currentSelectedId].add(diseaseId);
        setPlacements(newPlacements);
        setScore((s) => s + 10);
        setBattleCorrectCount((c) => c + 1);
        setTotalCorrectCount((c) => c + 1);
        setLastWrongChipId(null);

        const allDone = feature.correctDiseaseIds.every((id) => newPlacements[currentSelectedId].has(id));
        if (allDone) {
          if (feature.correctDiseaseIds.length > 1) {
            setBattleMultiFound((m) => m + 1);
            setTotalMultiFound((m) => m + 1);
          }
          setFeedback({ type: 'ok', feature, diseaseName: battle?.diseases.find((d) => d.id === diseaseId)?.name });

          // Check battle complete
          const allFeaturesDone = battle.features.every((f) =>
            f.correctDiseaseIds.every((id) => newPlacements[f.id]?.has(id))
          );
          if (allFeaturesDone) {
            if (battleCompleteTimeoutRef.current) clearTimeout(battleCompleteTimeoutRef.current);
            battleCompleteTimeoutRef.current = setTimeout(() => {
              // Signal battle complete - handled by page component
            }, 800);
          }
          return null; // deselect
        } else {
          setFeedback({ type: 'partial', feature, diseaseName: battle?.diseases.find((d) => d.id === diseaseId)?.name });
          return null; // deselect
        }
      } else {
        setScore((s) => Math.max(0, s - 5));
        setBattleWrongCount((w) => w + 1);
        setTotalWrongCount((w) => w + 1);
        setLastWrongChipId(currentSelectedId);
        setBattleMissedFeatures((prev) =>
          prev.find((m) => m.id === feature.id) ? prev : [...prev, feature]
        );
        setAllMissedFeatures((prev) =>
          prev.find((m) => m.id === feature.id) ? prev : [...prev, feature]
        );
        setFeedback({ type: 'bad', feature });
        return null; // deselect
      }
    });
  }, [battle, placements]);

  const nextBattle = useCallback(() => {
    const next = currentBattleIndex + 1;
    if (next >= allBattles.length) {
      return true; // Game complete
    }
    setCurrentBattleIndex(next);
    initBattle(next);
    return false;
  }, [currentBattleIndex, allBattles.length, initBattle]);

  return {
    battle,
    currentBattleIndex,
    score,
    selectedFeatureId,
    placements,
    battleCorrectCount,
    battleWrongCount,
    battleMultiFound,
    battleMissedFeatures,
    feedback,
    lastWrongChipId,
    alreadyPlacedColumnId,
    totalCorrectCount,
    totalWrongCount,
    totalMultiFound,
    allMissedFeatures,
    isFeatureDone,
    initGame,
    onChipTap,
    onColumnTap,
    nextBattle,
  };
}
