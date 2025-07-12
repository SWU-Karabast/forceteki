import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PunishingOne extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8687233791',
            internalName: 'punishing-one#dengars-jumpmaster',
        };
    }


    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Ready this unit',
            when: {
                onCardDefeated: (event, context) =>
                    event.card.isUnit() &&
                    event.card.isInPlay() &&
                    event.card.isUpgraded() &&
                    event.card.controller !== context.player,
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.ready(),
            limit: AbilityHelper.limit.perRound(1)
        });
    }
}
