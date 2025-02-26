import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';


export default class ReinforcementWalker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8691800148',
            internalName: 'reinforcement-walker',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Look at the top card of your deck. Draw it or discard it and heal 3 damage from your base.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndChooseOption(
                (context) => {
                    const topCardOfDeck = context.player.getTopCardOfDeck();

                    return {
                        target: topCardOfDeck,
                        perCardButtons: [
                            { text: 'Draw', arg: 'draw', immediateEffect: AbilityHelper.immediateEffects.drawSpecificCard(() => ({ target: topCardOfDeck })) },
                            { text: 'Discard', arg: 'discard', immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                                AbilityHelper.immediateEffects.discardSpecificCard(() => ({ target: topCardOfDeck })),
                                AbilityHelper.immediateEffects.heal({ amount: 3, target: context.player.base })
                            ]) }
                        ]
                    };
                }
            )
        });
    }
}
