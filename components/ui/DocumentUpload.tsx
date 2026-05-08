import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { DocumentFile } from '../../types/forms';

interface DocumentUploadProps {
  label: string;
  required?: boolean;
  value: DocumentFile | null;
  onChange: (file: DocumentFile | null) => void;
  error?: string;
  type?: 'document' | 'image' | 'both';
  hint?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  required = false,
  value,
  onChange,
  error,
  type = 'both',
  hint,
}) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick document. Please try again.');
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      });
    }
  };

  const handlePress = () => {
    if (type === 'document') {
      pickDocument();
    } else if (type === 'image') {
      pickImage();
    } else {
      Alert.alert('Upload File', 'Choose file source', [
        { text: 'Camera Roll', onPress: pickImage },
        { text: 'Files / PDF', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const isImage =
    value?.type?.startsWith('image/') || value?.uri?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TouchableOpacity
        style={[styles.uploadBox, error ? styles.uploadBoxError : null, value ? styles.uploadBoxFilled : null]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {value ? (
          <View style={styles.filePreview}>
            {isImage ? (
              <Image source={{ uri: value.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.docIcon}>
                <Text style={styles.docIconText}>📄</Text>
              </View>
            )}
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {value.name}
              </Text>
              {value.size && (
                <Text style={styles.fileSize}>
                  {(value.size / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onChange(null)}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.uploadIcon}>📎</Text>
            <Text style={styles.uploadText}>Tap to upload</Text>
            <Text style={styles.uploadSubText}>
              {type === 'image' ? 'JPG, PNG' : type === 'document' ? 'PDF, DOC' : 'PDF, JPG, PNG'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.labelColor,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  required: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '700',
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    minHeight: 80,
    overflow: 'hidden',
  },
  uploadBoxError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  uploadText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadSubText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  imagePreview: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray200,
  },
  docIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docIconText: {
    fontSize: 26,
  },
  fileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fileName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.black,
  },
  fileSize: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  removeBtn: {
    padding: Spacing.sm,
  },
  removeBtnText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '700',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default DocumentUpload;
