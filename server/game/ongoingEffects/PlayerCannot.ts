import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { EffectName } from '../core/Constants';
import { Restriction } from '../core/ongoingEffect/effectImpl/Restriction';
import type Player from '../core/Player';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';

type IPlayerCannotProperties =
  | string
  | {
      cannot: string;
      applyingPlayer?: Player;
      restrictedActionCondition?: (context: AbilityContext) => boolean;
      source?: Card;
  };

export function playerCannot(properties: IPlayerCannotProperties) {
    return OngoingEffectBuilder.player.static(
        EffectName.AbilityRestrictions,
        new Restriction(
            typeof properties === 'string'
                ? { type: properties }
                : Object.assign({ type: properties.cannot }, properties))
    );
}
