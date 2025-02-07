import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class ScanningOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0505904136',
            internalName: 'scanning-officer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Reveal up to 4 Vigilance cards from your hand',
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                // TODO: should Scanning Officer always choose readied resources?
                target: context.player.opponent.getRandomResources(context, 3),
                useDisplayPrompt: true,
                promptedPlayer: RelativePlayer.Self
            })),
            then: (thenContext) => ({
                title: 'Defeat each resource with Smuggle',
                effect: 'defeat',
                immediateEffect: AbilityHelper.immediateEffects.sequential(() => {
                    const smuggleCards = thenContext.events[0].cards.filter((card) => card.hasSomeKeyword(KeywordName.Smuggle));
                    return [
                        AbilityHelper.immediateEffects.defeat({
                            target: smuggleCards
                        }),
                        AbilityHelper.immediateEffects.resourceCard({
                            targetPlayer: RelativePlayer.Opponent,
                            target: thenContext.player.opponent.getTopCardsOfDeck(smuggleCards.length)
                        })
                    ];
                }),
            })
        });
    }
}
