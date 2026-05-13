import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/shared/stores/useAppStore";
import {
  buildOnboardingProfile,
  saveAuthToStorage,
  signInWithGoogle,
  signInWithInstagram,
} from "@/api/services/auth.service";
import { ONBOARDING_VOICE_QUESTIONS, ONBOARDING_HERO_IMAGES } from "@/api/mocks/onboarding.mock";
import { INSTAGRAM_SIGNAL_CARDS } from "@/api/mocks/signals.mock";

export const AuthOnboardingFlow: React.FC = () => {
  const { setIsAuthenticated } = useAppStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", instagram: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % ONBOARDING_HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (step === 0 && (!form.name.trim() || !form.email.trim())) return;
    if (step >= 3 && step < 3 + ONBOARDING_VOICE_QUESTIONS.length) {
      const qIndex = step - 3;
      const q = ONBOARDING_VOICE_QUESTIONS[qIndex];
      if (currentAnswer.trim()) {
        setAnswers((prev) => ({ ...prev, [q.id]: currentAnswer }));
      }
      setCurrentAnswer("");
    }
    setStep((prev) => prev + 1);
  };

  const handleComplete = () => {
    const profile = buildOnboardingProfile(form, answers);
    saveAuthToStorage(profile);
    setIsAuthenticated(true);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    setIsAuthenticated(true);
  };

  const handleInstagramSignIn = async () => {
    await signInWithInstagram();
    setIsAuthenticated(true);
  };

  // Step 0: Welcome + basic info
  if (step === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Hero carousel */}
        <div className="relative h-[45vh] overflow-hidden">
          {ONBOARDING_HERO_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === heroIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-bold text-white mb-2">fAIshion</h1>
            <p className="text-white/80 text-sm">Your AI-powered style companion</p>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="Instagram handle (optional)"
              className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!form.name.trim() || !form.email.trim()}
            className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            Continue
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-neutral-400">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white border border-neutral-200 text-neutral-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <GoogleIcon size={16} />
            Continue with Google
          </button>

          <button
            onClick={handleInstagramSignIn}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <InstagramIcon size={16} />
            Connect Instagram
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Instagram connect prompt
  if (step === 1) {
    return (
      <div className="flex flex-col h-full bg-white px-6 py-6">
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Connect Instagram</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Link your Instagram to get personalized style recommendations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INSTAGRAM_SIGNAL_CARDS.map((card) => (
              <div key={card.title} className="bg-neutral-50 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-neutral-900">{card.title}</p>
                <p className="text-xs text-neutral-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleInstagramSignIn}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold"
          >
            Connect Instagram
          </button>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-semibold"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Voice questions intro
  if (step === 2) {
    return (
      <div className="flex flex-col h-full bg-white px-6 py-6">
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
            <MicIcon size={32} className="text-neutral-600" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Quick Style Quiz</h2>
            <p className="text-sm text-neutral-500">
              Answer {ONBOARDING_VOICE_QUESTIONS.length} quick questions so we can personalize your experience
            </p>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Steps 3+: Voice questions
  const questionIndex = step - 3;
  if (questionIndex < ONBOARDING_VOICE_QUESTIONS.length) {
    const question = ONBOARDING_VOICE_QUESTIONS[questionIndex];
    return (
      <div className="flex flex-col h-full bg-white px-6 py-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              {questionIndex + 1} / {ONBOARDING_VOICE_QUESTIONS.length}
            </span>
            <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${((questionIndex + 1) / ONBOARDING_VOICE_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900">{question.label}</h2>
            <p className="text-sm text-neutral-500 mt-1">{question.prompt}</p>
          </div>

          <div className="space-y-2">
            {question.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setCurrentAnswer(suggestion)}
                className={`w-full p-3 rounded-xl text-left text-sm transition ${
                  currentAnswer === suggestion
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm outline-none resize-none h-24"
          />

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            <MicIcon size={16} />
            {isRecording ? "Recording... Tap to stop" : "Tap to speak"}
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {questionIndex === ONBOARDING_VOICE_QUESTIONS.length - 1 ? "Complete" : "Next"}
        </button>
      </div>
    );
  }

  // Final step: Complete
  return (
    <div className="flex flex-col h-full bg-white px-6 py-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckIcon size={32} className="text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">You're all set!</h2>
          <p className="text-sm text-neutral-500">
            Welcome to fAIshion, {form.name}. Let's discover your style.
          </p>
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
      >
        Get Started
      </button>
    </div>
  );
};

/* Icons */
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MicIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
