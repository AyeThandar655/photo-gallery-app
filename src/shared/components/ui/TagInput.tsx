import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/ui';
import { colors, radii, spacing, typography } from '@/shared/theme';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  error?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

export function TagInput({ value, onChange, label, error, hint, style }: TagInputProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const hasError = Boolean(error);

  const commitTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (tag.length === 0 || value.includes(tag)) {
      setInputText('');
      return;
    }
    onChange([...value, tag]);
    setInputText('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleChangeText = (text: string) => {
    if (text.endsWith(',')) {
      commitTag(text);
    } else {
      setInputText(text);
    }
  };

  return (
    <View style={style}>
      {label !== undefined && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      {/* Chip row */}
      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {value.map((tag) => (
            <View key={tag} style={styles.chip}>
              <Text variant="label" style={styles.chipText}>
                {tag}
              </Text>
              <Pressable
                onPress={() => removeTag(tag)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove tag ${tag}`}
                style={({ pressed }) => [
                  styles.chipRemove,
                  pressed && styles.chipRemovePressed,
                ]}
              >
                <Text variant="caption" style={styles.chipRemoveText}>
                  ×
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Text input */}
      <TextInput
        ref={inputRef}
        value={inputText}
        onChangeText={handleChangeText}
        onSubmitEditing={() => commitTag(inputText)}
        blurOnSubmit={false}
        returnKeyType="done"
        placeholder="Add a tag…"
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          hasError && styles.inputError,
        ]}
        accessibilityLabel={label ?? 'Tags'}
        accessibilityHint="Type a tag and press Return or comma to add it"
        aria-invalid={hasError}
      />

      {hasError ? (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      ) : hint !== undefined ? (
        <Text variant="caption" color="secondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipScroll: {
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  chipText: {
    color: colors.textInverse,
  },
  chipRemove: {
    borderRadius: radii.full,
    padding: 2,
  },
  chipRemovePressed: {
    opacity: 0.6,
  },
  chipRemoveText: {
    color: colors.textInverse,
    fontSize: 14,
    lineHeight: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    color: colors.text,
    ...typography.body,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.borderError,
  },
  errorText: {
    color: colors.textError,
    marginTop: spacing.xs,
  },
});
