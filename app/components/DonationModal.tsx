import React from 'react';
import { View, Text, Modal, ActivityIndicator, Linking } from 'react-native';
import { Button } from 'react-native-ui-lib';
import {modalStyles, styles} from '@/app/screens/MainStyles';
import { translate } from '@/app/helpers/i18n';

interface DonationModalProps {
  visible: boolean;
  isLoading: boolean;
  result: {
    name: string;
    description: string;
    websiteLink: string;
  } | null;
  onClose: () => void;
  userLanguage: string;
}

const DonationModal: React.FC<DonationModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  userLanguage,
}) => {
  const handleOpenLink = () => {
    if (result?.websiteLink) {
      const url = `https://translate.google.com/translate?sl=auto&tl=${userLanguage}&u=${encodeURIComponent(result.websiteLink)}`;
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          {isLoading ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <Text style={modalStyles.modalTitle}>
                {translate('donationInfo')}
              </Text>
              <Text style={modalStyles.modalText}>{result?.name}</Text>
              <Text style={modalStyles.modalText}>{result?.description}</Text>
              <Button
                style={modalStyles.modalButton}
                onPress={handleOpenLink}
                label={translate('viewInGoogleTranslate')}
              />
              <Button
                style={modalStyles.modalCloseButton}
                onPress={onClose}
                label={translate('close')}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DonationModal;