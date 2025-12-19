import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { BaseCard } from '../../../core/card/BaseCard';
import { Aspect, Conjunction, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export abstract class LAWCommonBase extends BaseCard {
    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        const aspects = [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning];
        registrar.setEpicActionAbility({
            title: `Play a card from your hand, ignoring 1 of its ${EnumHelpers.aspectString(aspects, Conjunction.Or)} aspect penalties`,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => ({
                    adjustCost: {
                        costAdjustType: CostAdjustType.IgnoreSpecificAspects,
                        ignoredAspect: this.determineIgnoredAspect(context, aspects)
                    },
                    playAsType: WildcardCardType.Any
                }))
            }
        });
    }

    private determineIgnoredAspect(context: AbilityContext, options: Aspect[]): Aspect {
        if (!context.target) {
            return options[0];
        }

        // Make it a set for easier lookup, since duplicates don't matter here
        const penaltyAspects = new Set(context.player.getPenaltyAspects(context.target.aspects));

        for (const aspect of options) {
            if (penaltyAspects.has(aspect)) {
                // Arbitrarily return the first aspect found that has a penalty
                return aspect;
            }
        }

        // If no penalty aspects found, default to the first option
        return options[0];
    }
}
