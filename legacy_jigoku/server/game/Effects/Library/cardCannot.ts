import type BaseCard from '../../basecard';
import { EffectNames } from '../../Constants';
import type Player from '../../player';
import { EffectBuilder } from '../EffectBuilder';
import Restriction from '../restriction';

type Props =
    | string
    | {
          cannot: string;
          applyingPlayer?: Player;
          restricts?: string;
          source?: BaseCard;
      };

export function cardCannot(properties: Props) {
    return EffectBuilder.card.static(
        EffectNames.AbilityRestrictions,
        new Restriction(
            typeof properties === 'string'
                ? { type: properties }
                : Object.assign({ type: properties.cannot }, properties)
        )
    );
}