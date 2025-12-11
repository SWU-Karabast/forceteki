import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer } from '../../../core/Constants';

export default class GreatPitOfCarkoon extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'great-pit-of-carkoon-id',
            internalName: 'great-pit-of-carkoon',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Discard a unit from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                cardCondition: (card) => card.isUnit(),
                target: context.player,
                amount: 1,
            })),
            ifYouDo: {
                title: 'Search your deck for a card named The Sarlacc of Carkoon, reveal it, and draw it',
                immediateEffect: AbilityHelper.immediateEffects.entireDeckSearch({
                    cardCondition: (card) => card.name === 'The Sarlacc of Carkoon',
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.drawSpecificCard(),
                        AbilityHelper.immediateEffects.reveal({
                            useDisplayPrompt: true,
                            promptedPlayer: RelativePlayer.Opponent
                        }),
                    ]),
                    shuffleWhenDone: true,
                }),
            },
        });
    }
}