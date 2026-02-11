import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface TransactionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionSearchModal: React.FC<TransactionSearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<'success' | 'notFound' | null>(null);

  const handleSearch = () => {
    // Simple mock search logic
    if (searchQuery.startsWith('SUD-') || searchQuery.startsWith('EDU-') || searchQuery.includes('1197') || searchQuery.includes('1198')) {
      // Navigate to tracking page with the reference number
      navigate(`/track/${searchQuery}`);
      handleClose();
    } else {
      setResult('notFound');
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setResult(null);
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {t('search.button')}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!result && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Search className="absolute top-3.5 right-3 rtl:right-auto rtl:left-3 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="w-full bg-[#276073] hover:bg-[#1e4a5a] disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                      {t('search.button')}
                    </button>
                  </div>
                )}

                {result && (
                  <div className="text-center space-y-4">
                    {result === 'success' ? (
                      <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <p className="text-lg font-semibold text-green-700">
                          {t('search.success')}
                        </p>
                        <p className="text-gray-600">
                          {searchQuery}
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <p className="text-lg font-semibold text-red-700">
                          {t('search.notFound')}
                        </p>
                        <p className="text-gray-600">
                          {searchQuery}
                        </p>
                      </>
                    )}
                    <button
                      onClick={handleClose}
                      className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t('search.close')}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TransactionSearchModal;