import React from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { styles, modalStyles } from '@/app/screens/MainStyles';
import { translate } from '@/app/helpers/i18n';
import GenericBottomSheet from './GenericBottomSheet'; // Adjust the import path as needed
import { useTranslations } from '@/hooks/ui/useTranslations';

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
  const { translate } = useTranslations();
  const handleOpenLink = () => {
    if (result?.websiteLink) {
      const url = `https://translate.google.com/translate?sl=auto&tl=${userLanguage}&u=${encodeURIComponent(result.websiteLink)}`;
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  return (
    <GenericBottomSheet visible={visible} onClose={onClose} enableScroll={true}>
      <Text style={modalStyles.modalTitle}>
        {translate('donationInfo')}
      </Text>
      {isLoading ? (
        <View style={[styles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <Text style={{textAlign: 'center', fontFamily: 'marcellus'}}>{translate("fetchingDonationInfo")}</Text>
        </View>
      ) : (
        <>
          <Text style={modalStyles.modalText}>{result?.name}</Text>
          <Text style={modalStyles.modalText}>{result?.description}</Text>
          <Button
            style={{ marginVertical: 8, maxWidth: '80%', alignSelf: 'center' }}
            onPress={handleOpenLink}
            label={translate('viewInGoogleTranslate')}
          />
        </>
      )}
    </GenericBottomSheet>
  );
};

export default DonationModal;