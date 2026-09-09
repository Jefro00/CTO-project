"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuelSlider = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const FuelSlider = ({ value, onChange, readonly = false }) => {
    const getFuelColor = (v) => {
        if (v <= 15)
            return 'bg-rose-500 text-rose-500';
        if (v <= 35)
            return 'bg-amber-500 text-amber-500';
        return 'bg-emerald-500 text-emerald-500';
    };
    return (<div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
          <lucide_react_1.Fuel className="w-4 h-4 text-slate-500"/> Уровень топлива
        </span>
        <span className="font-mono text-sm font-bold text-slate-900">{value}%</span>
      </div>

      {/* Visual Fuel Gauge Bar */}
      <div className="h-5 w-full bg-slate-200 rounded-lg p-0.5 relative overflow-hidden flex border border-slate-300">
        <div className={`h-full rounded-md transition-all duration-300 ${getFuelColor(value).split(' ')[0]}`} style={{ width: `${value}%` }}/>
        {/* Quarter ticks */}
        <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-40 text-[9px] font-bold text-slate-900">
          <span>E</span>
          <span>1/4</span>
          <span>1/2</span>
          <span>3/4</span>
          <span>F</span>
        </div>
      </div>

      {!readonly && (<input type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"/>)}
    </div>);
};
exports.FuelSlider = FuelSlider;
//# sourceMappingURL=FuelSlider.js.map