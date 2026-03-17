import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PalpatinesReturn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4643489029',
            internalName: 'palpatines-return',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Play a unit from your discard pile. It costs ${TextHelper.resource(6)} less. If it's a Force unit, it costs ${TextHelper.resource(8)} less instead.`,
            targetResolver: {
                mode: TargetMode.Single,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.hasSomeTrait(Trait.Force),
                    onTrue: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 8 },
                        playAsType: WildcardCardType.Unit,
                    }),
                    onFalse: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 6 },
                        playAsType: WildcardCardType.Unit,
                    })
                }),
            }
        });
    }
}
