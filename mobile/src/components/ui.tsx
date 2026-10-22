import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { OrderStatus } from "../types";
import { colors, radius, statusMeta } from "../theme";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {children}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function StatusPill({
  status,
  compact = false,
}: {
  status: OrderStatus;
  compact?: boolean;
}) {
  const meta = statusMeta[status];

  return (
    <View
      style={[
        styles.statusPill,
        compact && styles.statusPillCompact,
        { backgroundColor: meta.background },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.statusText, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.buttonTextSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string | null }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null]}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyMark}>
        <Text style={styles.emptyMarkText}>N</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function LoadingState({ label = "載入中…" }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.errorTitle}>未能載入</Text>
      <Text style={styles.emptyDescription}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>再試一次</Text>
      </Pressable>
    </View>
  );
}

export function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, strong && styles.detailValueStrong]}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonDanger: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#5b252b",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: "#7d343c",
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 54,
    gap: 10,
  },
  emptyMark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: 4,
  },
  emptyMarkText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "700",
  },
  retryButton: {
    marginTop: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    flexShrink: 0,
  },
  detailValue: {
    color: colors.text,
    fontSize: 13,
    textAlign: "right",
    flex: 1,
  },
  detailValueStrong: {
    fontSize: 18,
    fontWeight: "800",
  },
});
