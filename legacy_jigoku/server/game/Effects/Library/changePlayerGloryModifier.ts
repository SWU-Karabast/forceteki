import { EffectNames } from '../../Constants';
import type Player from '../../player';
import { EffectBuilder } from '../EffectBuilder';

export type ChangePlayerGloryModifierValue = number | ((player: Player) => number);

export function changePlayerGloryModifier(value: ChangePlayerGloryModifierValue) {
    return EffectBuilder.player.flexible(EffectNames.ChangePlayerGloryModifier, value);
}