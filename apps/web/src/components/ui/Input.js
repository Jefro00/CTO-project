"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const react_1 = __importDefault(require("react"));
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
exports.Input = react_1.default.forwardRef(({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (<div className="w-full">
        {label && (<label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>)}
        <div className="relative rounded-lg shadow-sm">
          {icon && (<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>)}
          <input ref={ref} id={inputId} className={(0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)('block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', icon ? 'pl-10' : 'pl-3.5', error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300', className))} {...props}/>
        </div>
        {error ? (<p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>) : helperText ? (<p className="mt-1 text-xs text-slate-500">{helperText}</p>) : null}
      </div>);
});
exports.Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map