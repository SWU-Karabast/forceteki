import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class AnakinSkywalkerMaverickMentor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2282198576',
            internalName: 'anakin-skywalker#maverick-mentor',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Coordinate: This unit gains On Attack: Draw a card',
            condition: (context) => context.source.controller.getArenaUnits().length >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Triggered,
                title: 'Draw a card',
                when: {
                    onAttackDeclared: (event, context) => event.attack.attacker === context.source
                },
                immediateEffect: AbilityHelper.immediateEffects.draw()
            })
        });
    }
}

AnakinSkywalkerMaverickMentor.implemented = true;
