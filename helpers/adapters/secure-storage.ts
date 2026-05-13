import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export class SecureStorage {
  // Guarda un valor de forma segura en el almacenamiento cifrado del dispositivo
  static async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el dato.');
    }
  }

  // Lee un valor del almacenamiento cifrado, devuelve null si no existe o falla
  static async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      Alert.alert('Error', 'No se pudo leer el dato.');
      return null;
    }
  }

  // Elimina un valor del almacenamiento cifrado
  static async deleteItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el dato.');
    }
  }
}
