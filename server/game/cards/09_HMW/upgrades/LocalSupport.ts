import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';

export default class LocalSupport extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1597342503',
            internalName: 'local-support',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Reveal the top card of your deck',
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                useDisplayPrompt: true,
                promptedPlayer: RelativePlayer.Self,
                target: context.player.getTopCardOfDeck()
            })),
            then: (thenContext) => ({
                title: 'Draw the top card of your deck',
                thenCondition: () => {
                    const revealedCard = thenContext.events[0]?.cards?.[0];
                    return revealedCard != null && thenContext.player.isTraitInPlay([...revealedCard.traits]);
                },
                immediateEffect: AbilityHelper.immediateEffects.drawSpecificCard({
                    target: thenContext.player.getTopCardOfDeck()
                })
            })
        });
    }
}