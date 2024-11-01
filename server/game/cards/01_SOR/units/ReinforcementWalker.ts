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

    private deckHasCards(context) {
        return context.source.controller.drawDeck.length > 0;
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Look at the top card of your deck',
            when: {
                onCardPlayed: (event, context) => event.card === context.source && this.deckHasCards(context),
                onAttackDeclared: (event, context) => event.attack.attacker === context.source && this.deckHasCards(context),
            },
            immediateEffect: AbilityHelper.immediateEffects.lookAt(
                (context) => ({ target: context.source.controller.getTopCardOfDeck() })
            ),
            then: (thenContext) => {
                const topCardOfDeck = thenContext.source.controller.getTopCardOfDeck();
                return {
                    title: `Draw "${topCardOfDeck.title}" or discard it and heal 3 damage from your base.`,
                    targetResolver: {
                        mode: TargetMode.Select,
                        choices: {
                            ['Draw']: AbilityHelper.immediateEffects.draw(),
                            ['Discard']: AbilityHelper.immediateEffects.simultaneous([
                                AbilityHelper.immediateEffects.discardCard(() => ({ target: topCardOfDeck })),
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
