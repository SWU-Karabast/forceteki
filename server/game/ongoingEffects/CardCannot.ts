import type { Card } from '../core/card/Card';
import { EffectName } from '../core/Constants';
import type Player from '../core/Player';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { Restriction } from '../core/ongoingEffect/effectImpl/Restriction';
import type { AbilityContext } from '../core/ability/AbilityContext';

type ICardCannotProperties =
  | string
  | {
      cannot: string;
      applyingPlayer?: Player;
      restrictedActionCondition?: (context: AbilityContext) => boolean;
      source?: Card;
  };

export function cardCannot(properties: ICardCannotProperties) {
    return OngoingEffectBuilder.card.static(
        EffectName.AbilityRestrictions,
        new Restriction(
            typeof properties === 'string'
                ? { type: properties }
                : Object.assign({ type: properties.cannot }, properties)
        )
    );
}
