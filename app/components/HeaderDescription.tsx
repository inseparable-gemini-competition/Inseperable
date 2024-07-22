import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from "@/app/screens/MainStyles";
import { translate } from '@/app/helpers/i18n';

interface HeaderDescriptionProps {
  country: string;
  description: string;
}

const HeaderDescription: React.FC<HeaderDescriptionProps> = ({ country, description }) => {

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{country}</Text>
    </View>
  );
};

export default HeaderDescription;