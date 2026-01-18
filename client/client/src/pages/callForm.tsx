import { useRef, useState } from "react";
import {
  Phone,
  User,
  DollarSign,
  TrendingDown,
  PhoneCall,
  PhoneOff,
  Mic,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "localhost:4000";

export default function CallForm() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioUnlockedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [loanAmount, setLoanAmount] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [paidEmis, setPaidEmis] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [outstandingAmount, setOutstandingAmount] = useState("");
  const [defaultMonths, setDefaultMonths] = useState("");

  const [recordCall, setRecordCall] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);

  function startListening() {
    if (isListeningRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => (isListeningRef.current = true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      wsRef.current?.send(
        JSON.stringify({ type: "user_message", text: transcript })
      );
    };

    recognition.onend = () => (isListeningRef.current = false);
    recognition.onerror = () => (isListeningRef.current = false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  function speak(text: string) {
    if (!audioUnlockedRef.current) return;

    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.onend = startListening;

    window.speechSynthesis.speak(utterance);
  }

  function startCall() {
    if (wsRef.current) return;

    audioUnlockedRef.current = true;
    const callId = crypto.randomUUID();
    const ws = new WebSocket(
      `ws://${BASE_URL}/ws/audio-call?callId=${callId}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsCallActive(true);

      ws.send(
        JSON.stringify({
          type: "init",
          context: {
            user: {
              name: customerName,
              phone: phoneNumber,
            },
            loan: {
              loanAmount,
              emiAmount,
              paidEmis,
              paidAmount,
              outstandingAmount,
              defaultMonths,
            },
            recordCall,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const data = JSON.parse(event.data);
      if (data.type === "ai_message") speak(data.text);
    };
  }

  function cleanup() {
    recognitionRef.current?.stop();
    wsRef.current?.close();
    wsRef.current = null;
    setIsCallActive(false);
    window.speechSynthesis.cancel();
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <PhoneCall className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Voice Collection Call
          </h1>
          <p className="text-slate-400 text-lg">Automated loan recovery assistant</p>
        </div>

        {isCallActive && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-5 flex items-center gap-4 animate-pulse">
            <div className="relative">
              <Mic className="w-6 h-6 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <div>
              <p className="font-semibold text-emerald-300">Call Active</p>
              <p className="text-sm text-emerald-400/80">Listening and responding...</p>
            </div>
          </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">Customer Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Name
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">Loan Details</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Loan Amount
              </label>
              <input
                placeholder="₹ 0.00"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                EMI Amount
              </label>
              <input
                placeholder="₹ 0.00"
                value={emiAmount}
                onChange={(e) => setEmiAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Paid EMIs
              </label>
              <input
                placeholder="0"
                value={paidEmis}
                onChange={(e) => setPaidEmis(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Paid Amount
              </label>
              <input
                placeholder="₹ 0.00"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Outstanding Amount
              </label>
              <input
                placeholder="₹ 0.00"
                value={outstandingAmount}
                onChange={(e) => setOutstandingAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Default Months
              </label>
              <input
                placeholder="0"
                value={defaultMonths}
                onChange={(e) => setDefaultMonths(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 p-3.5 rounded-lg transition-all outline-none text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={startCall}
            disabled={isCallActive}
            className="group relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-700 disabled:to-slate-700 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 disabled:shadow-none flex items-center justify-center gap-3"
          >
            <PhoneCall className="w-5 h-5" />
            {isCallActive ? "Call In Progress" : "Start Call"}
          </button>

          <button
            onClick={cleanup}
            disabled={!isCallActive}
            className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-800 hover:to-red-500 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
          
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </div>

        {/* <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Call Recording</p>
            <p>All calls are automatically recorded for quality assurance and training purposes.</p>
          </div>
        </div> */}

      </div>
    </div>
  );
}
