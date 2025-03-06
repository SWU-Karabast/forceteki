import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers.js';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AnnihilatorTaggesFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8582806124',
            internalName: 'annihilator#tagges-flagship'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat an enemy unit',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Look at an opponent\'s hand',
                immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                    target: context.player.opponent.hand,
                    useDisplayPrompt: true
                })),
                ifYouDo: () => {
                    const matchingCardNames = ifYouDoContext.player.opponent.hand.filter((card) => card.name === ifYouDoContext.target.name);
                    return {
                        title: `Discard a copy of ${ifYouDoContext.target.name} from hand`,
                        ifYouDoCondition: () => matchingCardNames.length > 0,
                        immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                            Helpers.asArray(matchingCardNames).map((target) =>
                                AbilityHelper.immediateEffects.discardSpecificCard({
                                    target: target
                                })
                            )
                        )
                    };
                }
            })
            // then: (thenContext) => ({
            //     title: ''
            // })
        });
    }

    // private buildDiscardSpecificEffects(ifYouDoContext) {

    // }
}