import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

export default function QrScanner({ visible, onClose, onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) requestPermission();
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color="white" />
          </Pressable>
          <Text style={styles.topTitle}>Escanear QR</Text>
          <View style={{ width: 44 }} />
        </View>

        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.6)" />
            <Text style={styles.permissionText}>Se necesita acceso a la cámara</Text>
            <Pressable style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Conceder permiso</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.topMask} />
              <View style={styles.middleRow}>
                <View style={styles.sideMask} />
                <View style={styles.scanBox}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={styles.sideMask} />
              </View>
              <View style={styles.bottomMask}>
                <Text style={styles.hint}>Apunta al código QR</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const MASK = 'rgba(0,0,0,0.62)';
const BOX_SIZE = 240;
const CORNER = 22;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 56, paddingBottom: 12,
    backgroundColor: 'black', zIndex: 10,
  },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700', color: 'white' },
  permissionContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32,
  },
  permissionText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  permissionBtn: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: '#571D11',
  },
  permissionBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  overlay: { ...StyleSheet.absoluteFillObject, top: 100 },
  topMask: { flex: 1, backgroundColor: MASK },
  middleRow: { flexDirection: 'row', height: BOX_SIZE },
  sideMask: { flex: 1, backgroundColor: MASK },
  scanBox: {
    width: BOX_SIZE, height: BOX_SIZE,
    borderRadius: 4,
  },
  bottomMask: {
    flex: 1.2, backgroundColor: MASK,
    alignItems: 'center', paddingTop: 24,
  },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: 'white' },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
});
