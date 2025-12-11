import { useState, useEffect } from 'react';

// State data for sun hours (mock data - can be replaced with API)
const stateSunData = {
  'AZ': { state: 'Arizona', sunHours: 6.5, avgRate: 0.13 },
  'CA': { state: 'California', sunHours: 5.8, avgRate: 0.23 },
  'CO': { state: 'Colorado', sunHours: 5.5, avgRate: 0.14 },
  'FL': { state: 'Florida', sunHours: 5.4, avgRate: 0.13 },
  'GA': { state: 'Georgia', sunHours: 5.0, avgRate: 0.12 },
  'IL': { state: 'Illinois', sunHours: 4.5, avgRate: 0.14 },
  'MA': { state: 'Massachusetts', sunHours: 4.2, avgRate: 0.22 },
  'NC': { state: 'North Carolina', sunHours: 5.0, avgRate: 0.11 },
  'NJ': { state: 'New Jersey', sunHours: 4.4, avgRate: 0.16 },
  'NV': { state: 'Nevada', sunHours: 6.2, avgRate: 0.12 },
  'NY': { state: 'New York', sunHours: 4.0, avgRate: 0.20 },
  'OH': { state: 'Ohio', sunHours: 4.2, avgRate: 0.13 },
  'PA': { state: 'Pennsylvania', sunHours: 4.3, avgRate: 0.14 },
  'TX': { state: 'Texas', sunHours: 5.6, avgRate: 0.12 },
  'WA': { state: 'Washington', sunHours: 3.8, avgRate: 0.10 },
  'DEFAULT': { state: 'Your Area', sunHours: 4.5, avgRate: 0.14 }
};

// Zip code to state mapping (simplified - first 3 digits)
const zipToState = {
  '850': 'AZ', '852': 'AZ', '853': 'AZ',
  '900': 'CA', '902': 'CA', '906': 'CA', '910': 'CA', '920': 'CA', '941': 'CA', '945': 'CA',
  '800': 'CO', '801': 'CO', '802': 'CO', '803': 'CO',
  '320': 'FL', '321': 'FL', '327': 'FL', '330': 'FL', '331': 'FL', '332': 'FL', '334': 'FL',
  '300': 'GA', '303': 'GA', '306': 'GA', '310': 'GA',
  '600': 'IL', '606': 'IL', '608': 'IL',
  '021': 'MA', '024': 'MA',
  '270': 'NC', '275': 'NC', '276': 'NC', '277': 'NC',
  '070': 'NJ', '071': 'NJ', '073': 'NJ', '074': 'NJ', '076': 'NJ',
  '890': 'NV', '891': 'NV',
  '100': 'NY', '104': 'NY', '110': 'NY', '112': 'NY', '117': 'NY',
  '430': 'OH', '432': 'OH', '440': 'OH', '441': 'OH', '442': 'OH',
  '150': 'PA', '151': 'PA', '152': 'PA', '190': 'PA', '191': 'PA',
  '750': 'TX', '752': 'TX', '770': 'TX', '773': 'TX', '774': 'TX', '780': 'TX',
  '980': 'WA', '981': 'WA', '982': 'WA', '983': 'WA', '984': 'WA',
};

function getStateFromZip(zip) {
  const prefix = zip.substring(0, 3);
  return zipToState[prefix] || 'DEFAULT';
}

export default function SolarCalculator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyBill: 150,
    zipCode: '',
    name: '',
    email: '',
    phone: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 4;

  // Calculate savings based on form data
  const calculateSavings = () => {
    const stateCode = getStateFromZip(formData.zipCode);
    const data = stateSunData[stateCode];

    // System sizing (rough estimate: $150/mo bill = ~6kW system in avg area)
    const annualUsage = (formData.monthlyBill / data.avgRate) * 12;
    const systemSize = Math.ceil(annualUsage / (data.sunHours * 365) * 1.2);
    const systemCost = systemSize * 2800; // $2.80/watt avg installed cost
    const federalCredit = systemCost * 0.30; // 30% ITC
    const netCost = systemCost - federalCredit;

    const annualProduction = systemSize * data.sunHours * 365;
    const annualSavings = Math.min(annualProduction * data.avgRate, formData.monthlyBill * 12);
    const paybackYears = netCost / annualSavings;
    const savings25Years = (annualSavings * 25) - netCost;

    return {
      state: data.state,
      sunHours: data.sunHours,
      systemSize,
      systemCost,
      federalCredit,
      netCost,
      annualSavings: Math.round(annualSavings),
      monthlyPayment: Math.round(netCost / 240), // 20-year financing
      paybackYears: paybackYears.toFixed(1),
      savings25Years: Math.round(savings25Years),
      firstYearSavings: Math.round(annualSavings - (netCost * 0.05)) // Assuming 5% financing
    };
  };

  // Handle loading/analysis simulation
  const runAnalysis = () => {
    setStep(3);
    setTimeout(() => {
      const results = calculateSavings();
      setAnalysis(results);
      setStep(4);
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Lead data structured for Zapier/Make.com integration
    const leadData = {
      timestamp: new Date().toISOString(),
      source: 'solar_calculator',
      lead: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        zipCode: formData.zipCode,
        monthlyBill: formData.monthlyBill
      },
      analysis: analysis,
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        landingPage: typeof window !== 'undefined' ? window.location.href : ''
      }
    };

    // Log for development (replace with actual endpoint)
    console.log('=== LEAD CAPTURED ===');
    console.log(JSON.stringify(leadData, null, 2));
    console.log('=====================');

    // Simulate API call
    // TODO: Replace with actual Zapier/Make.com webhook
    // await fetch('https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK/', {
    //   method: 'POST',
    //   body: JSON.stringify(leadData)
    // });

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);

    // Redirect to thank you page after brief delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/thank-you';
      }
    }, 2000);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 ${
                step >= s
                  ? 'bg-gradient-to-r from-solar-500 to-solar-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > s ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-solar-500 to-solar-600 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Monthly Bill */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            What's your monthly electric bill?
          </h3>
          <p className="text-gray-600 mb-8">
            This helps us estimate your solar system size and savings.
          </p>

          <div className="bg-gradient-to-br from-solar-50 to-sky-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-gradient">
                ${formData.monthlyBill}
              </span>
              <span className="text-gray-500 text-lg">/month</span>
            </div>

            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={formData.monthlyBill}
              onChange={(e) => setFormData({ ...formData, monthlyBill: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-6
                         [&::-webkit-slider-thumb]:h-6
                         [&::-webkit-slider-thumb]:bg-gradient-to-r
                         [&::-webkit-slider-thumb]:from-solar-500
                         [&::-webkit-slider-thumb]:to-solar-600
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110"
            />

            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>$50</span>
              <span>$500+</span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="btn-primary w-full text-lg py-4"
          >
            Continue
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 2: Zip Code */}
      {step === 2 && (
        <div className="animate-fadeIn">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            What's your zip code?
          </h3>
          <p className="text-gray-600 mb-8">
            We'll use this to calculate sun exposure and local incentives.
          </p>

          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="Enter 5-digit zip code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                className="input-field pl-12 text-xl text-center tracking-widest"
              />
            </div>

            {formData.zipCode.length === 5 && (
              <div className="mt-4 p-4 bg-solar-50 rounded-lg border border-solar-200 animate-fadeIn">
                <div className="flex items-center gap-2 text-solar-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium">
                    {stateSunData[getStateFromZip(formData.zipCode)]?.sunHours || 4.5} peak sun hours/day
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back
            </button>
            <button
              onClick={runAnalysis}
              disabled={formData.zipCode.length !== 5}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Calculate Savings
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Analyzing... */}
      {step === 3 && (
        <div className="animate-fadeIn text-center py-12">
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-4 border-solar-200 rounded-full animate-spin" style={{ borderTopColor: '#22c55e' }} />
              {/* Inner pulsing sun */}
              <div className="absolute inset-4 bg-gradient-to-br from-solar-400 to-solar-600 rounded-full animate-pulse flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Analyzing Your Roof Potential...
          </h3>

          <div className="space-y-3 text-gray-600">
            <AnalysisStep text="Calculating sun exposure" delay={0} />
            <AnalysisStep text="Estimating system size" delay={800} />
            <AnalysisStep text="Finding local incentives" delay={1600} />
            <AnalysisStep text="Computing 25-year savings" delay={2400} />
          </div>
        </div>
      )}

      {/* Step 4: Results & Lead Capture */}
      {step === 4 && analysis && (
        <div className="animate-fadeIn">
          {!isSubmitted ? (
            <>
              {/* Savings Preview */}
              <div className="bg-gradient-to-br from-solar-600 to-sky-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
                <div className="text-center">
                  <p className="text-solar-100 text-sm uppercase tracking-wide mb-2">
                    Your Estimated 25-Year Savings
                  </p>
                  <div className="text-5xl font-bold mb-4">
                    {formatCurrency(analysis.savings25Years)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-2xl font-bold">{formatCurrency(analysis.annualSavings)}</p>
                      <p className="text-solar-100 text-sm">per year</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-2xl font-bold">{analysis.paybackYears} yrs</p>
                      <p className="text-solar-100 text-sm">payback period</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Capture Form */}
              <div className="bg-white rounded-2xl p-8 border-2 border-solar-200 shadow-card">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Get Your Free Custom Report
                  </h3>
                  <p className="text-gray-600 text-sm">
                    See detailed breakdown, financing options, and connect with verified installers.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Get My Free Report
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-gray-400 text-xs text-center mt-4">
                  By submitting, you agree to receive solar quotes. No obligation. Unsubscribe anytime.
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-20 h-20 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                You're All Set!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                A solar expert will contact you shortly with your personalized report and quote options.
              </p>

              {/* Final Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-4">Your Solar Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{analysis.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">System Size</p>
                    <p className="font-medium text-gray-900">{analysis.systemSize} kW</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. System Cost</p>
                    <p className="font-medium text-gray-900">{formatCurrency(analysis.systemCost)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Federal Tax Credit</p>
                    <p className="font-medium text-solar-600">-{formatCurrency(analysis.federalCredit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Cost</p>
                    <p className="font-medium text-gray-900">{formatCurrency(analysis.netCost)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Payment*</p>
                    <p className="font-medium text-gray-900">{formatCurrency(analysis.monthlyPayment)}/mo</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  *Estimated with 20-year financing at 5% APR. Actual rates vary.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Analysis step animation component
function AnalysisStep({ text, delay }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay);
    const checkTimer = setTimeout(() => setChecked(true), delay + 600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(checkTimer);
    };
  }, [delay]);

  if (!visible) return null;

  return (
    <div className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {checked ? (
        <svg className="w-5 h-5 text-solar-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span className={checked ? 'text-gray-900' : 'text-gray-500'}>{text}</span>
    </div>
  );
}
