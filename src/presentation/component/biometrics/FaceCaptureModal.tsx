import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BiometricService } from '../../../service/BiometricService';
import { useThemeColors } from '../../context/ThemeContext';

export interface FaceCaptureModalProps {
  visible: boolean;
  mode: 'enroll' | 'verify';
  vaultId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const FaceCaptureModal: React.FC<FaceCaptureModalProps> = ({
  visible,
  mode,
  vaultId,
  onSuccess,
  onClose,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const colors = useThemeColors();

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error('Failed to capture photo');

      if (mode === 'enroll') {
        await BiometricService.enrollFace(photo.uri);
      } else {
        await BiometricService.verifyFace(photo.uri, vaultId);
      }

      onSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  if (!visible) return null;

  // Permissions not yet resolved
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={[styles.container, { backgroundColor: colors.bg.default }]}>
          <ActivityIndicator size="large" color={colors.accent.default} />
        </View>
      </Modal>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={[styles.container, styles.centeredContent, { backgroundColor: colors.bg.default }]}>
          <Text style={[styles.permissionTitle, { color: colors.text.default }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.permissionBody, { color: colors.muted.default }]}>
            Face recognition requires camera access to capture a photo.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent.default }]}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonLabel}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={[styles.cancelLabel, { color: colors.muted.default }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const instructionText =
    mode === 'enroll'
      ? 'Position your face inside the oval'
      : 'Look directly at the camera';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Live camera preview */}
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />

        {/* Oval face guide overlay */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.ovalGuide} />
        </View>

        {/* Instruction text */}
        <View style={styles.topBar}>
          <Text style={styles.modeLabel}>
            {mode === 'enroll' ? 'FACE ENROLMENT' : 'FACE VERIFICATION'}
          </Text>
          <Text style={styles.instruction}>{instructionText}</Text>
        </View>

        {/* Controls */}
        <View style={styles.bottomBar}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#BFFF00" style={styles.loader} />
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              activeOpacity={0.85}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
            <Text style={[styles.cancelLabel, loading && styles.disabledText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalGuide: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 2.5,
    borderColor: '#BFFF00',
    marginBottom: 80, // offset upward from center for natural face position
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  modeLabel: {
    color: '#BFFF00',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  instruction: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
    opacity: 0.9,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#BFFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#BFFF00',
  },
  loader: {
    height: 76,
    width: 76,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  cancelLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  disabledText: {
    opacity: 0.3,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    color: '#BFFF00',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 12,
  },
  primaryButtonLabel: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default FaceCaptureModal;
