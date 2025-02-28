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
            title: 'Reveal 3 enemy resources. Defeat each resource with Smuggle that was revealed and replace it with the top card of its controllers deck.',
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                target: context.player.opponent.getRandomResources(context, 3),
                useDisplayPrompt: true,
                promptedPlayer: RelativePlayer.Self
            })),
            then: (thenContext) => ({
                title: 'Defeat each resource with Smuggle',
                effect: 'defeat',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(() => {
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
