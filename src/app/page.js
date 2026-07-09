'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, CheckCircle, Loader2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function Home() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef(null);

  const downloadReceipt = () => {
    const input = receiptRef.current;
    if (!input) return;
    toPng(input, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Shivpratha_Wari_Seva_Receipt.pdf');
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        alert('Failed to generate PDF. Please try again.');
      });
  };
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    amount: ''
  });

  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('donations')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('donations')
        .getPublicUrl(filePath);

      // 2. Call Next.js API for Green API (WhatsApp)
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          screenshotUrl: publicUrl
        })
      });

      if (!res.ok) {
        throw new Error('Failed to send notification');
      }

      // 3. Move to Success Step
      setStep(3);

    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const upiId = '7020883433@ybl';
  const payeeName = 'Shubham Sunil Barmukh';
  const params = `pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${formData.amount}&tn=Wari+Seva+Donation&cu=INR`;
  
  const upiIntent = `upi://pay?${params}`;
  const gpayIntent = `tez://upi/pay?${params}`;
  const phonepeIntent = `phonepe://pay?${params}`;

  return (
    <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      
      {/* Step 1: Form */}
      {step === 1 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-rust mb-2">Pandharpur Wari Seva</h2>
            <p className="text-gray-500 text-sm">Join us in serving the Varkaris</p>
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameLabel')}</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneLabel')}</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addressLabel')}</label>
              <textarea
                required
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none resize-none text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('amountLabel')}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input
                  required
                  type="number"
                  min="1"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-gray-900 font-semibold text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-rust hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-4"
            >
              {t('proceedBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{t('paymentBanner')}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{t('paymentInstruction')}</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <QRCodeSVG value={upiIntent} size={200} level="M" includeMargin={true} className="bg-white p-2 rounded-lg shadow-sm" />
            <p className="text-sm text-gray-500 font-medium text-center">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
          </div>

          <div className="flex flex-col gap-2">
            <a 
              href={upiIntent} 
              className="flex items-center justify-center gap-3 bg-brand-navy text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-brand-navy/90 transition-colors"
            >
              <img src="/upi.png" alt="UPI" className="h-6 w-auto object-contain brightness-0 invert" />
              Pay via UPI App
            </a>
            <p className="text-xs text-gray-500 text-center mt-1">
              If the button above fails, please scan the QR code from another phone.
            </p>
          </div>
          
          <div className="text-center text-lg font-semibold text-gray-700">
            Amount: ₹{formData.amount}
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-gold transition-colors bg-gray-50">
              <input
                required
                type="file"
                accept="image/*"
                id="receipt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {file ? file.name : t('uploadLabel')}
                </span>
                <span className="text-xs text-brand-rust bg-brand-gold/20 px-3 py-1 rounded-full font-semibold">
                  Browse File
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? t('uploading') : t('uploadBtn')}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Back to Form
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Success & Receipt */}
      {step === 3 && (
        <div className="p-6 md:p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('thankYouTitle')}</h2>
          
          {/* Receipt DOM */}
          <div 
            ref={receiptRef} 
            className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6"
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            <div className="flex items-center justify-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <img src="/logo.jpg" alt="Shivpratha Logo" className="h-12 w-auto object-contain" />
              <h3 className="font-bold text-xl text-brand-navy">शिवप्रथा फाउंडेशन</h3>
            </div>
            
            <div className="space-y-3 mb-6 text-gray-800 font-medium text-left">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">देणगीदाराचे नाव:</span>
                <span>{formData.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">रक्कम:</span>
                <span className="font-bold text-brand-rust">₹ {formData.amount}</span>
              </div>
            </div>

            <div className="bg-brand-gold/10 p-4 rounded-lg text-sm text-gray-700 leading-relaxed text-center italic border border-brand-gold/30">
              "तुमच्या अमूल्य योगदानाबद्दल मनःपूर्वक धन्यवाद. तुमची ही देणगी वारकऱ्यांच्या अन्न, पाणी आणि वैद्यकीय सेवेसाठी वापरली जाईल."
              <div className="mt-3 font-semibold text-brand-navy not-italic">- शुभम बारमुख (संस्थापक, शिवप्रथा फाउंडेशन)</div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={downloadReceipt}
              className="w-full flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              <Download className="w-5 h-5" />
              पावती डाउनलोड करा (Download PDF)
            </button>
            <button
               onClick={() => {
                  setFormData({name: '', phone: '', address: '', amount: ''});
                  setFile(null);
                  setStep(1);
               }}
               className="py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Make another donation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
