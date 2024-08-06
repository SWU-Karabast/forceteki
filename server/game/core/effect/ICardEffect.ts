import type { EffectName } from '../Constants';
import type { GameObject } from '../GameObject';

export interface ICardEffect {
    type: EffectName;
    value: any;
    getValue: <T = any>(obj: GameObject) => T;
}
