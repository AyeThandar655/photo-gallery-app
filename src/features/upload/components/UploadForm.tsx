import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/shared/components/ui';
import { colors, spacing } from '@/shared/theme';
import { UploadPhotoBodySchema } from '@/schemas';
import type { UploadPhotoBody, UploadPhotoResponse } from '@/types';
import { getUserMessage } from '@/utils';
import { useUploadPhoto } from '../mutation';
import { useImagePicker } from '../useImagePicker';
import { ImagePreview } from './ImagePreview';
import { TagInput } from '../../photo/components/TagInput';

interface UploadFormProps {
  onSuccess: (response: UploadPhotoResponse) => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const mutation = useUploadPhoto();
  const { asset, pick, clear } = useImagePicker();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadPhotoBody>({
    resolver: zodResolver(UploadPhotoBodySchema),
    defaultValues: {
      uri: '',
      type: '',
      name: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (asset !== null) {
      setValue('uri', asset.uri, { shouldValidate: false });
      setValue('type', asset.mimeType ?? 'image/jpeg', { shouldValidate: false });
      setValue(
        'name',
        asset.fileName ?? `photo_${Date.now()}.jpg`,
        { shouldValidate: false },
      );
    } else {
      setValue('uri', '', { shouldValidate: false });
      setValue('type', '', { shouldValidate: false });
      setValue('name', '', { shouldValidate: false });
    }
  }, [asset, setValue]);

  const onSubmit = (data: UploadPhotoBody) => {
    mutation.mutate(data, {
      onSuccess: (response) => {
        onSuccess(response);
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Image picker */}
      <ImagePreview
        uri={asset?.uri ?? null}
        onPress={asset !== null ? clear : pick}
        error={errors.uri?.message}
      />

      {/* Tags */}
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

      {/* Mutation error banner */}
      {mutation.isError && (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text variant="caption" style={styles.errorBannerText}>
            {getUserMessage(mutation.error)}
          </Text>
        </View>
      )}

      <Button
        label={mutation.isPending ? 'Uploading…' : 'Upload'}
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        accessibilityHint="Upload the selected photo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.destructive,
    borderRadius: 4,
    padding: spacing.sm,
  },
  errorBannerText: {
    color: colors.textError,
  },
});
