import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';


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
            immediateEffect: AbilityHelper.immediateEffects.lookAt(
                (context) => ({ target: context.source.controller.getTopCardOfDeck() })
            ),
            then: (thenContext) => {
                const topCardOfDeck = thenContext.source.controller.getTopCardOfDeck();
                return {
                    title: `Draw "${topCardOfDeck.title}" or discard it and heal 3 damage from your base.`,
                    thenCondition: (context) => context.source.controller.drawDeck.length > 0,
                    targetResolver: {
                        mode: TargetMode.Select,
                        choices: {
                            ['Draw']: AbilityHelper.immediateEffects.drawSpecificCard(() => ({ target: topCardOfDeck })),
                            ['Discard']: AbilityHelper.immediateEffects.simultaneous([
                                AbilityHelper.immediateEffects.discardSpecificCard(() => ({ target: topCardOfDeck })),
                                AbilityHelper.immediateEffects.heal({ amount: 3, target: thenContext.source.controller.base })
                            ])
                        }
                    }
                };
            }
        });
    }
}

ReinforcementWalker.implemented = true;
