import React from 'react';
interface FuelSliderProps {
    value: number;
    onChange: (val: number) => void;
    readonly?: boolean;
}
export declare const FuelSlider: React.FC<FuelSliderProps>;
export {};
