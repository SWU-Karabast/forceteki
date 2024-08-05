import type { EffectNames } from '../Constants';
import type { GameObject } from '../GameObject';

export interface ICardEffect {
    type: EffectNames;
    value: any;
    getValue: <T = any>(obj: GameObject) => T;
}
