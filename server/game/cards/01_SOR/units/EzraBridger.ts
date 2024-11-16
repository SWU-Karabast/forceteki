import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';
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
            ifYouDo: {
                title: 'You may play it, discard it, or leave it on top of your deck.',
                targetResolver: {
                    mode: TargetMode.Select,
                    choices: {
                        ['Play it']: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({ target: context.source.controller.getTopCardOfDeck() })),
                        ['Discard it']: AbilityHelper.immediateEffects.discardSpecificCard((context) => ({ target: context.source.controller.getTopCardOfDeck() })),
                        ['Leave it on top of your deck']: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                    }
                }
            }
        });
    }
}

EzraBridger.implemented = true;