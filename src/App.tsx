import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Wallet, AlertTriangle, CheckCircle, Settings, Play, Square, RefreshCw, ChevronRight, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RiskTolerance = 'LOW' | 'MEDIUM' | 'HIGH';
type Chain = 'eip155:1' | 'eip155:8453' | 'eip155:42161' | 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

interface Config {
  riskTolerance: RiskTolerance;
  chain: Chain;
  constraints: string;
}

interface CycleData {
  id: number;
  timestamp: string;
  portfolio: string;
  riskSummary: string;
  riskScore: number;
  decision: string;
  owsRequest: {
    type: string;
    chain: string;
    from: string;
    to: string;
    amount: string;
    slippage: string;
    policyCheck: string;
    payload: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected';
  txHash?: string;
}

const CHAINS: Record<Chain, string> = {
  'eip155:1': 'Ethereum',
  'eip155:8453': 'Base',
  'eip155:42161': 'Arbitrum',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana'
};

const generateMockCycle = (id: number, config: Config, previousPortfolioValue: number): { cycle: CycleData, newValue: number } => {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  
  // Randomize risk score based on some volatility
  const baseRisk = Math.floor(Math.random() * 40);
  const spike = Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0;
  const riskScore = Math.min(100, baseRisk + spike);
  
  let riskSummary = "Market stable, normal volatility.";
  if (riskScore > 75) riskSummary = "CRITICAL: Rug signals detected, massive liquidity drop.";
  else if (riskScore > 55) riskSummary = "ELEVATED: Sudden pump and concentrated sell pressure.";
  else if (riskScore > 35) riskSummary = "MODERATE: Minor social hype mismatch.";

  let decision = "Holding current positions. Risk is acceptable.";
  let actionType = "none";
  let amount = "0";
  let fromToken = "USDC";
  let toToken = "USDC";
  
  // Decision Engine Logic
  if (config.riskTolerance === 'LOW' && riskScore >= 35) {
    decision = "Risk threshold exceeded for LOW tolerance. Auto-exiting to stablecoin.";
    actionType = "swap";
    fromToken = "WETH";
    toToken = "USDC";
    amount = "100%";
  } else if (config.riskTolerance === 'MEDIUM' && riskScore >= 55) {
    decision = "Risk threshold exceeded for MEDIUM tolerance. Hedging positions.";
    actionType = "swap";
    fromToken = "WETH";
    toToken = "USDC";
    amount = "50%";
  } else if (config.riskTolerance === 'HIGH' && riskScore >= 75) {
    decision = "Mandatory full exit triggered due to extreme risk.";
    actionType = "swap";
    fromToken = "PEPE";
    toToken = "USDC";
    amount = "100%";
  } else if (riskScore < 20 && Math.random() > 0.5) {
    decision = "Low risk environment. Executing small opportunistic trade.";
    actionType = "swap";
    fromToken = "USDC";
    toToken = "WETH";
    amount = "2 USDC";
  }

  // Simulate Portfolio Value change
  const changePercent = (Math.random() - 0.5) * 0.05; // -2.5% to +2.5%
  const newValue = previousPortfolioValue * (1 + changePercent);
  
  const portfolioStr = `1.5 WETH ($${(newValue * 0.6).toFixed(2)}), 500 USDC ($500.00), 1000 PEPE ($${(newValue * 0.1).toFixed(2)})`;

  let owsRequest = null;
  let status: 'pending' | 'approved' | 'rejected' = 'pending';
  let txHash = undefined;

  if (actionType !== 'none') {
    const isApproved = Math.random() > 0.1; // 90% approval rate
    status = isApproved ? 'approved' : 'rejected';
    txHash = isApproved ? `0x${Math.random().toString(16).substring(2, 64)}` : undefined;
    
    owsRequest = {
      type: actionType,
      chain: config.chain,
      from: fromToken,
      to: toToken,
      amount: amount,
      slippage: "0.5%",
      policyCheck: isApproved ? "Respected (Within spend limits)" : "Violated (Exceeds daily max tx size)",
      payload: `{ "method": "ows_sign", "params": { "to": "0xDexRouter...", "data": "0x..." } }`
    };
  } else {
    status = 'approved'; // No action needed
  }

  return {
    cycle: {
      id,
      timestamp: now,
      portfolio: portfolioStr,
      riskSummary,
      riskScore,
      decision,
      owsRequest,
      status,
      txHash
    },
    newValue
  };
};

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<Config>({
    riskTolerance: 'MEDIUM',
    chain: 'eip155:8453',
    constraints: 'Max 5% portfolio per trade'
  });

  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(5000);
  const cycleIdRef = useRef(1);

  const runCycle = () => {
    const { cycle, newValue } = generateMockCycle(cycleIdRef.current++, config, portfolioValue);
    setPortfolioValue(newValue);
    setCycles(prev => [cycle, ...prev].slice(0, 50)); // Keep last 50
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        runCycle();
      }, 5000); // Run every 5 seconds for demo purposes
    }
    return () => clearInterval(interval);
  }, [isActive, config, portfolioValue]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 font-mono">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Sentinel OWS</h1>
          </div>
          <p className="text-slate-400 mb-8 text-sm">Risk-Aware Auto-Trading Sentinel powered by Open Wallet Standard.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Tolerance</label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as RiskTolerance[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setConfig({...config, riskTolerance: level})}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      config.riskTolerance === level 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                        : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Starting Chain</label>
              <select 
                value={config.chain}
                onChange={(e) => setConfig({...config, chain: e.target.value as Chain})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(CHAINS).map(([id, name]) => (
                  <option key={id} value={id}>{name} ({id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Constraints</label>
              <input 
                type="text"
                value={config.constraints}
                onChange={(e) => setConfig({...config, constraints: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g., Max 2 USDC per tx"
              />
            </div>

            <button 
              onClick={() => {
                setIsConfigured(true);
                runCycle(); // Run first cycle immediately
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Zap className="w-4 h-4" />
              Initialize Sentinel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const latestCycle = cycles[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Sentinel Dashboard
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isActive ? 'LIVE' : 'PAUSED'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">OWS Policy Engine Enforced • No Private Key Exposure</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-4">
              <div className="text-xs text-slate-500">Config</div>
              <div className="text-sm font-medium text-slate-300">{config.riskTolerance} Risk • {CHAINS[config.chain]}</div>
            </div>
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                isActive 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              {isActive ? <><Square className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
            </button>
            <button 
              onClick={runCycle}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Force Cycle"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setIsConfigured(false); setIsActive(false); }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Wallet className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Total Value</h2>
            </div>
            <div className="text-3xl font-bold text-white">${portfolioValue.toFixed(2)}</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Tracking 3 assets
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Current Risk Score</h2>
            </div>
            <div className="flex items-end gap-3">
              <div className={`text-3xl font-bold ${
                latestCycle?.riskScore >= 75 ? 'text-rose-500' : 
                latestCycle?.riskScore >= 55 ? 'text-amber-500' : 
                'text-emerald-400'
              }`}>
                {latestCycle?.riskScore || 0}
              </div>
              <div className="text-sm text-slate-500 mb-1">/ 100</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className={`h-full ${
                  latestCycle?.riskScore >= 75 ? 'bg-rose-500' : 
                  latestCycle?.riskScore >= 55 ? 'bg-amber-500' : 
                  'bg-emerald-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${latestCycle?.riskScore || 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Lock className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">OWS Policy Engine</h2>
            </div>
            <div className="text-sm text-slate-300 space-y-2 mt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Key Exposure:</span>
                <span className="text-emerald-400 font-medium">0% (Vaulted)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Tx:</span>
                <span className={latestCycle?.status === 'rejected' ? 'text-rose-400' : 'text-slate-300'}>
                  {latestCycle?.status === 'rejected' ? 'Rejected by Policy' : latestCycle?.txHash ? 'Approved & Signed' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-800/50 border-b border-slate-800 p-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Sentinel Logs
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              </span>
              Awaiting next cycle...
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-sm">
            <AnimatePresence initial={false}>
              {cycles.map((cycle) => (
                <motion.div 
                  key={cycle.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-l-2 border-slate-700 pl-4 py-1"
                >
                  <div className="text-slate-500 mb-2">
                    ---<br/>
                    🛡️ Sentinel Cycle #{cycle.id} — {cycle.timestamp}
                  </div>
                  
                  <div className="space-y-1 text-slate-300">
                    <div><span className="text-slate-400">📊 Current Portfolio:</span> {cycle.portfolio}</div>
                    <div>
                      <span className="text-slate-400">🔍 Risk Analysis:</span> {cycle.riskSummary} → 
                      <span className={`ml-2 font-bold ${
                        cycle.riskScore >= 75 ? 'text-rose-400' : 
                        cycle.riskScore >= 55 ? 'text-amber-400' : 
                        'text-emerald-400'
                      }`}>
                        Risk Score: {cycle.riskScore}/100
                      </span>
                    </div>
                    <div><span className="text-slate-400">💡 Decision & Reasoning:</span> <span className="text-white">{cycle.decision}</span></div>
                    
                    {cycle.owsRequest && (
                      <div className="mt-3 bg-slate-950/50 border border-slate-800 rounded p-3 text-xs">
                        <div className="text-emerald-400 mb-1 font-bold">📤 OWS Transaction Request:</div>
                        <ul className="space-y-1 ml-2 text-slate-400">
                          <li>• Type: <span className="text-slate-300">{cycle.owsRequest.type}</span></li>
                          <li>• Chain: <span className="text-slate-300">{cycle.owsRequest.chain}</span></li>
                          <li>• From: <span className="text-slate-300">{cycle.owsRequest.from}</span></li>
                          <li>• To: <span className="text-slate-300">{cycle.owsRequest.to}</span></li>
                          <li>• Amount: <span className="text-slate-300">{cycle.owsRequest.amount}</span></li>
                          <li>• Slippage: <span className="text-slate-300">{cycle.owsRequest.slippage}</span></li>
                          <li>• Policy Check: <span className={cycle.owsRequest.policyCheck.includes('Violated') ? 'text-rose-400' : 'text-emerald-400'}>{cycle.owsRequest.policyCheck}</span></li>
                          <li>• Payload: <span className="text-slate-500 break-all">{cycle.owsRequest.payload}</span></li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-slate-800">
                          <span className="text-slate-400">🔗 Expected Tx Hash: </span>
                          {cycle.txHash ? (
                            <a href="#" className="text-blue-400 hover:underline">{cycle.txHash}</a>
                          ) : (
                            <span className="text-rose-400">Rejected by Policy Engine</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-slate-500 mt-2">---</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {cycles.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                No cycles executed yet. Click "Start" to begin.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
