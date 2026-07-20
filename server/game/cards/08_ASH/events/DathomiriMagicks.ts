import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
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
            title: `If you control a ${TextHelper.Trait.Force} unit, this event costs ${TextHelper.resource(1)} less to play`,
            amount: 1,
            condition: (context) => context.player.isTraitInPlay(Trait.Force)
        });

        registrar.setEventAbility({
            title: `Play up to 3 non-${TextHelper.Trait.Vehicle} units that each cost 2 or less from your discard pile for free`,
            immediateEffect: AbilityHelper.immediateEffects.playMultipleCardsFromDiscard({
                activePromptTitle: 'Choose a unit to play for free',
                maxCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle) && card.cost <= 2,
                playAsType: WildcardCardType.Unit,
                adjustCost: { costAdjustType: CostAdjustType.Free },
            })
        });
    }
}
