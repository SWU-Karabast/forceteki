import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ObiWansAetherspriteThisIsWhyIHateFlying extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6648824001',
            internalName: 'obiwans-aethersprite#this-is-why-i-hate-flying',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to this unit',
            optional: true,
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage({ amount: 1 }),
                AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: ZoneName.SpaceArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
            ])
        });
    }
}

ObiWansAetherspriteThisIsWhyIHateFlying.implemented = true;
