import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';


export default class R2D2IgnoringProtocol extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9568000754',
            internalName: 'r2d2#ignoring-protocol'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 1 })
        });
    }
}

R2D2IgnoringProtocol.implemented = true;
