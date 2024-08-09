import type Card from '../core/card/Card';
import { EffectName } from '../core/Constants';
import type Player from '../core/Player';
import { EffectBuilder } from '../core/effect/EffectBuilder';
import { Restriction } from '../core/effect/effectImpl/Restriction';
import type { AbilityContext } from '../core/ability/AbilityContext';

type CardCannotProperties =
    | string
    | {
          cannot: string;
          applyingPlayer?: Player;
          restrictedActionCondition?: (context: AbilityContext) => boolean;
          source?: Card;
      };

export function cardCannot(properties: CardCannotProperties) {
    return EffectBuilder.card.static(
        EffectName.AbilityRestrictions,
        new Restriction(
            typeof properties === 'string'
                ? { type: properties }
                : Object.assign({ type: properties.cannot }, properties)
        )
    );
}