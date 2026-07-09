'use client';

import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

// Translation dictionary
const translations = {
  mr: {
    // Header
    brand: 'शिवप्रथा फाउंडेशन - पंढरपूर वारी सेवा',
    toggle: 'English',
    // Form Page
    nameLabel: 'नाव (उदा. राजेश कुमार)',
    phoneLabel: 'मोबाईल नंबर',
    addressLabel: 'पत्ता',
    amountLabel: 'देणगी रक्कम',
    proceedBtn: 'पुढे जा',
    // Payment Page
    paymentBanner: 'वारकरी सेवेसाठी देणगी',
    paymentInstruction: 'कृपया खालील QR कोड स्कॅन करा किंवा तुमच्या मोबाईलमधील कोणत्याही UPI ॲपद्वारे पे करा.',
    payViaApp: 'UPI ॲपद्वारे पे करा',
    uploadLabel: 'पेमेंट यशस्वी झाल्याचा स्क्रीनशॉट अपलोड करा',
    uploadBtn: 'पावती डाउनलोड करा', // "Download Receipt" as requested
    // Success Page
    thankYouTitle: 'धन्यवाद! तुमची देणगी यशस्वीरित्या नोंदवली गेली आहे.',
    thankYouText: 'तुमची मदत वारकऱ्यांच्या अन्न, पाणी आणि वैद्यकीय सेवेसाठी वापरली जाईल.',
    // Validation Errors / General
    required: 'हे क्षेत्र आवश्यक आहे',
    uploading: 'अपलोड करत आहे...',
  },
  en: {
    // Header
    brand: 'Shivpratha Foundation - Pandharpur Wari Seva',
    toggle: 'मराठी',
    // Form Page
    nameLabel: 'Name (e.g., Rajesh Kumar)',
    phoneLabel: 'Mobile Number',
    addressLabel: 'Address',
    amountLabel: 'Donation Amount',
    proceedBtn: 'Proceed',
    // Payment Page
    paymentBanner: 'Donation for Varkari Seva',
    paymentInstruction: 'Please scan the QR code below or pay via any UPI app on your mobile device.',
    payViaApp: 'Pay via UPI App',
    uploadLabel: 'Upload Payment Success Screenshot',
    uploadBtn: 'Download Receipt',
    // Success Page
    thankYouTitle: 'Thank You! Your donation has been recorded.',
    thankYouText: 'Your contribution will be utilized for providing food, water, and medical services to the Varkaris.',
    // Validation Errors / General
    required: 'This field is required',
    uploading: 'Uploading...',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('mr'); // default language is Marathi

  const toggleLanguage = () => {
    setLang(prev => (prev === 'mr' ? 'en' : 'mr'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
