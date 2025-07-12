import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DengarTheDemolisher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8031540027',
            internalName: 'dengar#the-demolisher'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to the upgraded unit',
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.isUpgrade(),
            },
            limit: AbilityHelper.limit.unlimited(),
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.event.card.parentCard
            }))
        });
    }
}
