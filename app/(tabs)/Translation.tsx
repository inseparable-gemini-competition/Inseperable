import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const TranslationScreen = () => {
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const translateText = async () => {
    if (!text) {
      Alert.alert('Error', 'Please enter text to translate.');
      return;
    }

    setLoading(true);
    try {
      // Simulate an API call to translate text
      setTimeout(() => {
        setTranslatedText(`Translated text of: "${text}"`);
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while translating the text.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to translate"
        value={text}
        onChangeText={setText}
      />
      <Button title="Translate" onPress={translateText} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {translatedText && !loading && <Text style={styles.resultText}>{translatedText}</Text>}
      {!translatedText && !loading && <Text style={styles.noDataText}>No translation available</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '80%',
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default TranslationScreen;
