import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';


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
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                const topCardOfDeck = context.player.getTopCardOfDeck();
                return {
                    useDisplayPrompt: true,
                    target: topCardOfDeck,
                    perCardButtons: [
                        {
                            text: 'Play it',
                            arg: 'play',
                            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({ target: topCardOfDeck, playAsType: WildcardCardType.Any })
                        },
                        {
                            text: 'Discard it',
                            arg: 'discard',
                            immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                        },
                        {
                            text: 'Leave it on top of your deck',
                            arg: 'leave',
                            immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                        }
                    ]
                };
            })
        });
    }
}
