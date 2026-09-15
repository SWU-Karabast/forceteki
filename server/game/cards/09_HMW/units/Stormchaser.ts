import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, RelativePlayer, Trait, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Stormchaser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'stormchaser-id',
            internalName: 'stormchaser'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Reveal a ${TextHelper.Trait.Disaster} card from your hand. If you do or if there's a ${TextHelper.Trait.Disaster} card in your discard pile, draw a card`,
            targetResolver: {
                activePromptTitle: `Reveal a ${TextHelper.Trait.Disaster} card from your hand`,
                canChooseNoCards: true,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Disaster),
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            },
            then: (thenContext) => ({
                title: 'Draw a card',
                thenCondition: () =>
                    thenContext.events.some((event) => event.name === EventName.OnCardRevealed) ||
                    thenContext.player.discardZone.hasSomeCard({ trait: Trait.Disaster }),
                immediateEffect: AbilityHelper.immediateEffects.draw()
            })
        });
    }
}
