import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType, TargetMode } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';


export default class EzraBridger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9560139036',
            internalName: 'ezra-bridger#resourceful-troublemaker'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Look at the top card of your deck.',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookAt(
                (context) => ({ target: context.source.controller.getTopCardOfDeck() })
            ),
            then: (thenContext) => {
                const topCardOfDeck = thenContext.source.controller.getTopCardOfDeck();
                return {
                    title: 'Look at the top card of your deck.',
                    thenCondition: (context) => context.source.controller.drawDeck.length > 0,
                    targetResolver: {
                        mode: TargetMode.Select,
                        choices: {
                            ['Play it']: AbilityHelper.immediateEffects.playCardFromOutOfPlay(() => ({ target: topCardOfDeck, playType: PlayType.PlayFromOutOfPlay })),
                            ['Discard it']: AbilityHelper.immediateEffects.discardSpecificCard(() => ({ target: topCardOfDeck })),
                            ['Leave it on top of your deck']: AbilityHelper.immediateEffects.noAction,
                        }
                    }
                };
            }
        });
    }
}

EzraBridger.implemented = true;