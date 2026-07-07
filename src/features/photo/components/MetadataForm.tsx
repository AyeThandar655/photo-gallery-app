import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, TagInput, Text } from '@/shared/components/ui';
import type { TagInputHandle } from '@/shared/components/ui';
import { colors, spacing } from '@/shared/theme';
import { UpdateMetadataBodySchema } from '@/schemas';
import type { PhotoId, UpdateMetadataBody } from '@/types';
import { getUserMessage } from '@/utils';
import { useUpdateMetadata } from '../mutations';

interface MetadataFormProps {
  photoId: PhotoId;
  initialTags: string[];
  onSuccess?: () => void;
}

export function MetadataForm({ photoId, initialTags, onSuccess }: MetadataFormProps) {
  const mutation = useUpdateMetadata();
  const tagInputRef = useRef<TagInputHandle>(null);

  const {
    control,
    handleSubmit,
  } = useForm<UpdateMetadataBody>({
    resolver: zodResolver(UpdateMetadataBodySchema),
    defaultValues: { tags: initialTags },
  });

  const onSubmit = (data: UpdateMetadataBody) => {
    // Flush any text still sitting in the input (user typed but didn't press Return).
    // flushPending() returns the tag synchronously so we can include it immediately
    // without waiting for a React state update cycle.
    const pending = tagInputRef.current?.flushPending() ?? null;
    const tags = pending !== null ? [...data.tags, pending] : data.tags;
    mutation.mutate(
      { id: photoId, tags },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="tags"
        render={({ field, fieldState }) => (
          <TagInput
            ref={tagInputRef}
            label="Tags"
            hint="Press Return or comma to add a tag"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      {mutation.isError && (
        <Text variant="caption" style={styles.mutationError}>
          {getUserMessage(mutation.error)}
        </Text>
      )}

      <Button
        label={mutation.isPending ? 'Updating…' : 'Update'}
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        style={styles.button}
        accessibilityHint="Update the tags for this photo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  mutationError: {
    color: colors.textError,
  },
  button: {
    alignSelf: 'center',
    minWidth: 160,
  },
});
