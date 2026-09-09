"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
const react_1 = __importDefault(require("react"));
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
exports.Select = react_1.default.forwardRef(({ label, options, error, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (<div className="w-full">
        {label && (<label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>)}
        <select ref={ref} id={selectId} className={(0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)('block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300', className))} {...props}>
          {options.map((opt) => (<option key={opt.value} value={opt.value}>
              {opt.label}
            </option>))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>);
});
exports.Select.displayName = 'Select';
//# sourceMappingURL=Select.js.map