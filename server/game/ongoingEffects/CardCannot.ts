import { EffectName } from '../core/Constants';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { Restriction } from '../core/ongoingEffect/effectImpl/Restriction';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';

type ICardCannotProperties =
  | string
  | {
      cannot: string;
      restrictedActionCondition?: (context: AbilityContext, source: Card) => boolean;
  };

export function cardCannot(properties: ICardCannotProperties) {
    return OngoingEffectBuilder.card.static(
        EffectName.AbilityRestrictions, (game) =>
            new Restriction(game,
                typeof properties === 'string'
                    ? { type: properties }
                    : Object.assign({ type: properties.cannot }, properties)
            )
    );
}
