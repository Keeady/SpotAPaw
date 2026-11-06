import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { WizardHeader } from "../wizard/wizard-header";
import { wizardRenderers } from "./wizard-renderers";
import type { SightingFormData, WizardConfig } from "./wizard-types";

type SightingWizardProps = {
  config: WizardConfig;
  /**
   * Data the wizard starts with (e.g. an existing pet when editing). Step
   * `skip` rules are evaluated against it, so even the first step can be skipped.
   */
  initialData?: SightingFormData;
  /** Called after the last visible step's onComplete resolves, with all collected data. */
  onFinish?: (data: SightingFormData) => void | Promise<void>;
  onCancel?: () => void;
};

type SubmitFn = () => void | Promise<void>;

/** Index of the first step after `from` that is not skipped, or -1 if none. */
function findNextIndex(
  config: WizardConfig,
  from: number,
  data: SightingFormData,
) {
  for (let i = from + 1; i < config.length; i++) {
    if (!config[i].skip?.(data)) return i;
  }
  return -1;
}

export function SightingWizard({
  config,
  initialData,
  onFinish,
  onCancel,
}: SightingWizardProps) {
  const { t } = useTranslation("wizard");
  const theme = useTheme();
  const [formData, setFormData] = useState<SightingFormData>(initialData ?? {});
  // -1 means every step is skipped for the initial data.
  const [index, setIndex] = useState(() =>
    findNextIndex(config, -1, initialData ?? {}),
  );
  // Indices of the steps the user actually visited, so Back never lands on a skipped one.
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const clearError = useCallback(() => setErrorMessage(undefined), []);
  const updateFormData = useCallback(
    (patch: SightingFormData) => setFormData((prev) => ({ ...prev, ...patch })),
    [],
  );

  // The active screen registers its own onComplete here.
  const submitRef = useRef<SubmitFn | null>(null);
  const registerSubmit = useCallback((fn: SubmitFn | null) => {
    submitRef.current = fn;
  }, []);

  const step = index >= 0 ? config[index] : undefined;

  // Edge case: every step is skipped, so there is nothing to show; finish straight away.
  const finishedEmptyRef = useRef(false);
  useEffect(() => {
    if (index === -1 && !finishedEmptyRef.current) {
      finishedEmptyRef.current = true;
      void onFinish?.(formData);
    }
  }, [index, formData, onFinish]);

  // Base onComplete: merge data, run the step's configured onComplete, advance.
  const onComplete = useCallback(
    async (patch: SightingFormData = {}) => {
      if (!step) return;
      let merged = { ...formData, ...patch };
      setLoading(true);
      setErrorMessage(undefined);
      try {
        setFormData(merged);
        const result = await step.onComplete(merged);
        if (result) {
          merged = { ...merged, ...result };
          setFormData(merged);
        }
        // Evaluate skip rules against the freshest data, not the stale state.
        const next = findNextIndex(config, index, merged);
        if (next === -1) {
          await onFinish?.(merged);
        } else {
          setHistory((h) => [...h, index]);
          setIndex(next);
        }
      } catch (error) {
        // Stay on the step and let the screen show the message.
        setErrorMessage(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [formData, step, config, index, onFinish],
  );

  const canGoBack = history.length > 0;

  const onBack = () => {
    setErrorMessage(undefined);
    if (canGoBack) {
      setIndex(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    } else {
      onCancel?.();
    }
  };

  if (!step) return null;

  const Screen = wizardRenderers[step.id];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  return (
    <View style={styles.container}>
      <WizardHeader title={step.title} subTitle={step.subtitle} />

      <View style={styles.body}>
        {/* key resets screen state when the step changes */}
        <Screen
          key={step.id}
          config={step}
          formData={formData}
          loading={loading}
          errorMessage={errorMessage}
          clearError={clearError}
          updateFormData={updateFormData}
          onComplete={onComplete}
          registerSubmit={registerSubmit}
        />
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        {(canGoBack || onCancel) && (
          <Button
            mode="outlined"
            onPress={onBack}
            disabled={loading}
            style={styles.footerButton}
          >
            {canGoBack ? t("back", "Back") : t("cancel", "Cancel")}
          </Button>
        )}
        <Button
          mode="contained"
          onPress={() => submitRef.current?.()}
          loading={loading}
          disabled={loading}
          style={styles.footerButton}
        >
          {step.nextActionName}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, paddingTop: 16 },
  footer: { flexDirection: "row", gap: 12, padding: 16 },
  footerButton: { flex: 1, borderRadius: 12 },
});
