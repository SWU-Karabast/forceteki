import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DathomiriMagicks extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8624812581',
            internalName: 'dathomiri-magicks',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `If you control a Force unit, this event costs ${TextHelper.resource(1)} less to play`,
            amount: 1,
            condition: (context) => context.player.isTraitInPlay(Trait.Force)
        });

        registrar.setEventAbility({
            title: 'Play up to 3 non-Vehicle units that each cost 2 or less from your discard pile for free',
            targetResolver: {
                activePromptTitle: 'Choose up to 3 units to play for free',
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle) && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Unit,
                })
            }
        });
    }
}
