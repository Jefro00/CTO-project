"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
const Card = ({ title, subtitle, action, headerBorder = true, children, className, ...props }) => {
    return (<div className={(0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)('bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all', className))} {...props}>
      {(title || action) && (<div className={(0, clsx_1.clsx)('px-5 py-4 flex items-center justify-between', headerBorder && 'border-b border-slate-100')}>
          <div>
            {typeof title === 'string' ? (<h3 className="text-base font-semibold text-slate-900">{title}</h3>) : (title)}
            {subtitle && (<p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>)}
          </div>
          {action && <div>{action}</div>}
        </div>)}
      <div className="p-5">{children}</div>
    </div>);
};
exports.Card = Card;
//# sourceMappingURL=Card.js.map