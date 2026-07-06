import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/shared/components/ui';
import { Text } from '@/shared/components/ui';
import { colors, spacing } from '@/shared/theme';
import { UpdateMetadataBodySchema } from '@/schemas';
import type { PhotoId, UpdateMetadataBody } from '@/types';
import { getUserMessage } from '@/utils';
import { useUpdateMetadata } from '../mutations';
import { TagInput } from './TagInput';

interface MetadataFormProps {
  photoId: PhotoId;
  initialTags: string[];
  onSuccess?: () => void;
}

export function MetadataForm({ photoId, initialTags, onSuccess }: MetadataFormProps) {
  const mutation = useUpdateMetadata();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UpdateMetadataBody>({
    resolver: zodResolver(UpdateMetadataBodySchema),
    defaultValues: { tags: initialTags },
  });

  const onSubmit = (data: UpdateMetadataBody) => {
    mutation.mutate(
      { id: photoId, tags: data.tags },
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
        label={mutation.isPending ? 'Saving…' : 'Save'}
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={!isDirty || mutation.isPending}
        style={styles.button}
        accessibilityHint="Save the updated tags for this photo"
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
    alignSelf: 'flex-start',
    minWidth: 100,
  },
});
