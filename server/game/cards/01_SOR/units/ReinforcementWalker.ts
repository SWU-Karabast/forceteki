import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';


export default class ReinforcementWalker extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

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
            ifYouDo: (ifYouDoContext) => {
                const topCardOfDeck = ifYouDoContext.source.controller.getTopCardOfDeck();
                return {
                    title: `Draw "${topCardOfDeck?.title}" or discard it and heal 3 damage from your base.`,
                    targetResolver: {
                        mode: TargetMode.Select,
                        choices: {
                            ['Draw']: AbilityHelper.immediateEffects.drawSpecificCard(() => ({ target: topCardOfDeck })),
                            ['Discard']: AbilityHelper.immediateEffects.simultaneous([
                                AbilityHelper.immediateEffects.discardSpecificCard(() => ({ target: topCardOfDeck })),
                                AbilityHelper.immediateEffects.heal({ amount: 3, target: ifYouDoContext.source.controller.base })
                            ])
                        }
                    }
                };
            }
        });
    }
}
