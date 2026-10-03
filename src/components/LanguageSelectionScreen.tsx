import React from 'react';
import { LanguageModal } from './LanguageModal';
import { LanguageOption } from '../i18n/translations';

interface LanguageSelectionScreenProps {
  onSelectLanguage: (lang: LanguageOption) => void;
  isFirstVisit?: boolean;
  onClose?: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = (props) => {
  return <LanguageModal {...props} />;
};
