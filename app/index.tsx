import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function GalleryScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Photo Gallery' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Milestone 0 — Bootstrap complete.</Text>
        <Text style={styles.subtext}>Gallery screen coming in Milestone 5.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
