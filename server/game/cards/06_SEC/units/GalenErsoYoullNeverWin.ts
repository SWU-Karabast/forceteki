import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, TargetMode } from '../../../core/Constants';
import { AllCardsTargetMode } from '../../../core/ongoingEffect/OngoingAllCardsForPlayerEffect';

export default class GalenErsoYoullNeverWin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'galen-erso#youll-never-win-id',
            internalName: 'galen-erso#youll-never-win',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Name a card',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.allNonLeaderCardTitles,
            },
            then: (thenContext) => ({
                title: `While this is in play, cards named ${thenContext.ability.card.title} cannot be played`,
                immediateEffect: abilityHelper.immediateEffects.allCardsForPlayerLastingEffect((context) => ({
                    duration: Duration.WhileSourceInPlay,
                    target: context.player.opponent,
                    cardTargetMode: AllCardsTargetMode.OwnedOrControlled,
                    cardTitle: thenContext.select,
                    effect: abilityHelper.ongoingEffects.blankAllCardsForPlayer(),
                }))
            })
        });
    }
}
