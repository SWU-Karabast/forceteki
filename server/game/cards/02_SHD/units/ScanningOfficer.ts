import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class ScanningOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0505904136',
            internalName: 'scanning-officer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Reveal 3 enemy resources. Defeat each resource with Smuggle that was revealed and replace it with the top card of its controllers deck.',
            immediateEffect: AbilityHelper.immediateEffects.randomSelection((context) => ({
                // TODO: Improve RandomSelectionSystem so that it can shuffle the resources like getRandomResources does
                // Even if the random selection effectivaly happens in getRandomResources, we use RandomSelectionSystem
                // to ensure that the chat log is correct
                target: context.player.opponent.getRandomResources(context, 3),
                count: Math.min(3, context.player.opponent.resources.length),
                innerSystem: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Self
                })
            })),
            then: (thenContext) => ({
                title: 'Defeat each resource with Smuggle',
                thenCondition: () => thenContext.events[0].cards.some((card) => card.hasSomeKeyword(KeywordName.Smuggle)),
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
                })
            })
        });
    }
}
