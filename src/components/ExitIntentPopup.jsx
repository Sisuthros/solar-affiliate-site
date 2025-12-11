import { useState, useEffect } from 'react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown this session
    const popupShown = sessionStorage.getItem('exitPopupShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e) => {
      // Only trigger when mouse leaves through the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Add delay before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log for development
    console.log('=== EXIT POPUP LEAD ===');
    console.log({ email, timestamp: new Date().toISOString() });
    console.log('=======================');

    // TODO: Send to your email service
    // await fetch('YOUR_ENDPOINT', {
    //   method: 'POST',
    //   body: JSON.stringify({ email })
    // });

    setIsSubmitted(true);

    // Close after showing success
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-solar-600 to-sky-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              LIMITED TIME
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            Wait! Don't Miss Out on $500+ in Savings
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {!isSubmitted ? (
            <>
              <p className="text-gray-600 mb-6">
                Get our exclusive <strong>Solar Savings Guide</strong> free — includes insider tips on maximizing tax credits and choosing the right installer.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-solar-500 focus:ring-4 focus:ring-solar-100 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-solar-500 to-solar-600 text-white font-semibold py-4 rounded-lg hover:from-solar-600 hover:to-solar-700 transform transition-all hover:scale-[1.02] shadow-lg"
                >
                  Send Me The Free Guide
                </button>
              </form>

              <p className="text-gray-400 text-xs text-center mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">What you'll learn:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-solar-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    How to claim the full 30% tax credit
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-solar-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Red flags to avoid with installers
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-solar-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Financing options that save thousands
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Inbox!</h3>
              <p className="text-gray-600">
                Your Solar Savings Guide is on its way.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!isSubmitted && (
          <div className="px-8 pb-6">
            <button
              onClick={handleClose}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              No thanks, I don't want to save money
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
