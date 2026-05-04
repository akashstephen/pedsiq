/**
 * useFeatureWarsEngine — Multi-column differential diagnosis sorting game
 */

'use client';

import { useState, useCallback } from 'react';
import {
  type FeatureWarsBattle,
  type FeatureWarsFeature,
  type FeatureWarsPhase,
  type ArcadeSession,
  type StudyListItem,
} from '@/types/arcade';
import { updateGameStats } from '@/lib/arcade-storage';

function generateSessionId(): string {
  return 'fw_' + Date.now().toString(36);
}

export function useFeatureWarsEngine(allBattles: FeatureWarsBattle[]) {
  const [phase, setPhase] = useState<FeatureWarsPhase>('splash');
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, Set<string>>>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [multiFound, setMultiFound] = useState(0);
  const [missedFeatures, setMissedFeatures] = useState<FeatureWarsFeature[]>([]);
  const [feedback, setFeedback] = useState<{type:'ok'|'partial'|'bad', feature:FeatureWarsFeature, diseaseName?:string} | null>(null);
  const [lastWrongChipId, setLastWrongChipId] = useState<string | null>(null);
  const [alreadyPlacedColumnId, setAlreadyPlacedColumnId] = useState<string | null>(null);

  const battle = allBattles[currentBattleIndex];

  const initBattle = useCallback((index: number) => {
    const b = allBattles[index];
    const newPlacements: Record<string, Set<string>> = {};
    b.features.forEach((f) => { newPlacements[f.id] = new Set(); });
    setPlacements(newPlacements);
    setSelectedFeatureId(null);
    setWrongCount(0);
    setCorrectCount(0);
    setMultiFound(0);
    setMissedFeatures([]);
    setFeedback(null);
    setLastWrongChipId(null);
    setAlreadyPlacedColumnId(null);
  }, [allBattles]);

  const startGame = useCallback(() => {
    setPhase('battle');
    setCurrentBattleIndex(0);
    setScore(0);
    initBattle(0);
  }, [initBattle]);

  const onChipTap = useCallback((featureId: string) => {
    if (isFeatureDone(featureId)) return;
    setLastWrongChipId(null);
    if (selectedFeatureId === featureId) {
      setSelectedFeatureId(null);
    } else {
      setSelectedFeatureId(featureId);
    }
  }, [selectedFeatureId]);

  const isFeatureDone = useCallback((featureId: string): boolean => {
    const f = battle?.features.find((x) => x.id === featureId);
    if (!f) return false;
    return f.correctDiseaseIds.every((id) => placements[featureId]?.has(id));
  }, [battle, placements]);

  const onColumnTap = useCallback((diseaseId: string) => {
    if (!selectedFeatureId) return;
    const feature = battle?.features.find((f) => f.id === selectedFeatureId);
    if (!feature) return;

    if (placements[selectedFeatureId]?.has(diseaseId)) {
      setAlreadyPlacedColumnId(diseaseId);
      setTimeout(() => setAlreadyPlacedColumnId(null), 400);
      return;
    }

    const isCorrect = feature.correctDiseaseIds.includes(diseaseId);

    if (isCorrect) {
      const newPlacements = { ...placements, [selectedFeatureId]: new Set(placements[selectedFeatureId]) };
      newPlacements[selectedFeatureId].add(diseaseId);
      setPlacements(newPlacements);
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setLastWrongChipId(null);

      const allDone = feature.correctDiseaseIds.every((id) => newPlacements[selectedFeatureId].has(id));
      if (allDone) {
        if (feature.correctDiseaseIds.length > 1) {
          setMultiFound((m) => m + 1);
        }
        setSelectedFeatureId(null);
        setFeedback({ type: 'ok', feature, diseaseName: battle?.diseases.find((d) => d.id === diseaseId)?.name });

        // Check battle complete
        const allFeaturesDone = battle.features.every((f) =>
          f.correctDiseaseIds.every((id) => newPlacements[f.id]?.has(id))
        );
        if (allFeaturesDone) {
          setTimeout(() => setPhase('battle-complete'), 800);
        }
      } else {
        setFeedback({ type: 'partial', feature, diseaseName: battle?.diseases.find((d) => d.id === diseaseId)?.name });
      }
    } else {
      setScore((s) => Math.max(0, s - 5));
      setWrongCount((w) => w + 1);
      setSelectedFeatureId(null);
      setLastWrongChipId(selectedFeatureId);
      // Use functional updater to avoid stale closure
      setMissedFeatures((prev) =>
        prev.find((m) => m.id === feature.id) ? prev : [...prev, feature]
      );
      setFeedback({ type: 'bad', feature });
    }
  }, [selectedFeatureId, battle, placements]);

  const nextBattle = useCallback(() => {
    const next = currentBattleIndex + 1;
    if (next >= allBattles.length) {
      // Final results
      const totalQ = allBattles.reduce((acc, b) => acc + b.features.length, 0);
      const session: ArcadeSession = {
        id: generateSessionId(),
        gameId: 'feature-wars',
        score,
        correctCount,
        wrongCount,
        totalQuestions: totalQ,
        accuracyPct: Math.round((correctCount / (correctCount + wrongCount || 1)) * 100),
        durationMs: 0,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      const missed: StudyListItem[] = missedFeatures.map((f) => ({
        questionId: f.id,
        gameId: 'feature-wars',
        text: f.text,
        correctAnswer: f.correctDiseaseIds.join(' + '),
        explanation: f.explanation,
        trap: f.trap,
        addedAt: new Date().toISOString(),
      }));
      updateGameStats('feature-wars', session, missed);
      setPhase('final');
      return;
    }
    setCurrentBattleIndex(next);
    initBattle(next);
    setPhase('battle');
  }, [currentBattleIndex, allBattles, score, correctCount, wrongCount, missedFeatures, initBattle]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return {
    phase,
    battle,
    currentBattleIndex,
    score,
    selectedFeatureId,
    placements,
    wrongCount,
    correctCount,
    multiFound,
    missedFeatures,
    feedback,
    lastWrongChipId,
    alreadyPlacedColumnId,
    isFeatureDone,
    startGame,
    onChipTap,
    onColumnTap,
    nextBattle,
    restartGame,
  };
}
