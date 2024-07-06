import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useCameraPermissions, CameraView } from 'expo-camera';
import * as Speech from 'expo-speech';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const Identify: React.FC = () => {
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasProcessedResultsRef = useRef(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('useEffect for permissions triggered');
    if (permission && !permission.granted) {
      console.log('Requesting camera permission');
      requestPermission();
    }

    return () => {
      console.log('Cleaning up: destroying Voice and clearing timeout');
      Voice.destroy().then(Voice.removeAllListeners);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [permission]);

  const isValidCommand = (command: string): boolean => {
    const isValid = /identify|price|read|flip/i.test(command);
    console.log('Command validity check:', command, isValid);
    return isValid;
  };

  const handleVoiceCommand = useCallback((command: string) => {
    if (isSpeaking) {
      console.log('Currently speaking, ignoring command:', command);
      return;
    }
    console.log('Handling voice command:', command);
    switch (true) {
      case /identify/i.test(command):
        console.log('Simulating identification');
        simulateIdentification('identify');
        break;
      case /price/i.test(command):
        console.log('Simulating price check');
        simulateIdentification('price');
        break;
      case /read/i.test(command):
        console.log('Simulating read');
        simulateIdentification('read');
        break;
      case /flip/i.test(command):
        console.log('Toggling camera facing');
        toggleCameraFacing();
        break;
      default:
        console.log('Unknown command:', command);
        showError('Unknown command.');
    }
  }, [isSpeaking]);

  const startVoiceRecognition = async () => {
    if (isListening) {
      console.log('Already listening, ignoring start request');
      return;
    }
    console.log('Starting voice recognition');
    setResultText(null);
    hasProcessedResultsRef.current = false;
    setRetryCount(0);

    try {
      await Voice.start('en-US');
      setIsListening(true);
      setResultText('Listening...');
      console.log('Voice recognition started');

      timeoutRef.current = setTimeout(async () => {
        if (isListening) {
          console.log('Voice recognition timeout, stopping');
          await stopVoiceRecognition();
          showError('No valid command detected.');
        }
      }, 6000);
    } catch (error) {
      console.log('Error starting voice recognition:', error);
      showError('An error occurred while starting voice recognition.');
    }
  };

  const stopVoiceRecognition = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log('Error stopping voice recognition:', error);
      showError('An error occurred while stopping voice recognition.');
    }
  };

  const retryVoiceRecognition = async () => {
    if (retryCount < 300) {
      setRetryCount(retryCount + 1);
      console.log(`Retrying voice recognition, attempt ${retryCount + 1}`);
      await startVoiceRecognition();
    } else {
      console.log('Max retries reached');
      showError('Could not understand the command. Please try again.');
    }
  };

  const onStart = () => {
    console.log('Speech started');
    setIsSpeaking(true);
    setLoading(false);
  };

  const onDone = () => {
    console.log('Speech done');
    setIsSpeaking(false);
    stopVoiceRecognition();
    setIsListening(false);
    setTimeout(() => {
      startVoiceRecognition();
    }, 1000);
  };

  const simulateIdentification = async (type: string) => {
    console.log('Simulating identification:', type);
    setLoading(true);
    setResultText('Processing...');
    setIsSpeaking(true);

    try {
      let result: string;
      await new Promise((resolve) => setTimeout(resolve, 2000));

      switch (type) {
        case 'identify':
          result = 'This is a famous statue of Liberty located in New York City, USA.';
          break;
        case 'price':
          result = 'The fair price for this item is approximately $100.';
          break;
        case 'read':
          result = 'The text reads: "In God We Trust."';
          break;
        default:
          result = 'Unknown command.';
      }

      setResultText(result);
      console.log('Identification result:', result);
      Speech.speak(result, {
        onStart,
        onDone,
      });
    } catch (error) {
      console.log('Error during identification simulation:', error);
      showError('An error occurred during the simulation.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => {
      const newFacing = current === 'back' ? 'front' : 'back';
      console.log('Camera facing toggled:', newFacing);
      return newFacing;
    });
    setResultText('Camera flipped.');
    startVoiceRecognition();
  };

  const showError = (message: string) => {
    console.log('Error:', message);
    setResultText(message);
    Speech.speak(message);
  };

  const onSpeechResults = useCallback(async (event: SpeechResultsEvent) => {
    if (hasProcessedResultsRef.current) {
      console.log('Results already processed, ignoring duplicate call');
      return;
    }
    hasProcessedResultsRef.current = true;

    console.log('Speech results:', event.value);
    let spokenText = event.value?.[0].toLowerCase().trim() || '';
    console.log('Processed spoken text:', spokenText);

    if (spokenText === 'id') {
      spokenText = 'identify';
    }

    if (isValidCommand(spokenText)) {
      console.log('Valid command detected:', spokenText);
      await stopVoiceRecognition();
      handleVoiceCommand(spokenText);
    } else {
      console.log('Invalid command, prompting retry');
      await retryVoiceRecognition();
    }

    Voice.destroy().then(Voice.removeAllListeners);
  }, [stopVoiceRecognition, handleVoiceCommand, retryVoiceRecognition]);

  const onSpeechError = useCallback(async (event: any) => {
    console.log('Speech error:', event.error.message);
    await stopVoiceRecognition();
    setIsListening(false);

    Voice.destroy().then(Voice.removeAllListeners);
    setTimeout(async () => {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      startVoiceRecognition();
    }, 1000);
  }, [stopVoiceRecognition]);

  useEffect(() => {
    console.log('Setting up Voice listeners');
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    setTimeout(() => {
      startVoiceRecognition();
    }, 1000);

    return () => {
      console.log('Cleaning up Voice listeners');
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechResults, onSpeechError]);

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {!loading && (
          <>
            <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification('identify')}>
              <Text style={styles.optionText}>Identify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification('price')}>
              <Text style={styles.optionText}>Find Fair Price</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification('read')}>
              <Text style={styles.optionText}>Read to Identify</Text>
            </TouchableOpacity>
            {resultText && <Text style={styles.resultText}>{resultText}</Text>}
            <View style={styles.voiceCommandContainer}>
              <TouchableOpacity onPress={isListening ? stopVoiceRecognition : startVoiceRecognition} style={styles.microphoneButton}>
                <Ionicons name={isListening ? 'mic-off' : 'mic'} size={32} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  camera: {
    height: height / 2, // Take half of the screen height
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  flipButton: {
    backgroundColor: '#007aff',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#fff',
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  voiceCommandContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  microphoneButton: {
    backgroundColor: '#007aff',
    borderRadius: 50,
    padding: 15,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Identify;
