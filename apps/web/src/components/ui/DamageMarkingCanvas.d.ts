import React from 'react';
import { DamageMarker } from '@automotive-os/types';
interface DamageMarkingCanvasProps {
    markers: DamageMarker[];
    onChange: (markers: DamageMarker[]) => void;
    readonly?: boolean;
}
export declare const DamageMarkingCanvas: React.FC<DamageMarkingCanvasProps>;
export {};
