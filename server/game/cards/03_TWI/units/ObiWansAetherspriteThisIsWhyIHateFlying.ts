import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ObiWansAetherspriteThisIsWhyIHateFlying extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6648824001',
            internalName: 'obiwans-aethersprite#this-is-why-i-hate-flying',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to this unit',
            optional: true,
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage({ amount: 1 }),
                AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: ZoneName.SpaceArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
            ])
        });
    }
}

