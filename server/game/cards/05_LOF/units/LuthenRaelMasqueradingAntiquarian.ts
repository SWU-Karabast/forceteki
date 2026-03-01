import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class LuthenRaelMasqueradingAntiquarian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5472129982',
            internalName: 'luthen-rael#masquerading-antiquarian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Search the top 5 of your deck for an item upgrade, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Item),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });
    }
}