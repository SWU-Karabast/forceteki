import type { IAbilityHelper } from '../../../AbilityHelper';
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
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: {
                        costAdjustType: CostAdjustType.IgnoreWildcardAspects,
                        wildcardAspects: new Set(aspects),
                        ignoreCount: 1
                    },
                    playAsType: WildcardCardType.Any
                })
            }
        });
    }
}
