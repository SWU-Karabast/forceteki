import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, TargetMode } from '../../../core/Constants';

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
                options: this.game.allCardTitles,
            },
            then: (thenContext) => ({
                title: `While this is in play, cards named ${thenContext.ability.card.title} cannot be played`,
                immediateEffect: abilityHelper.immediateEffects.playerLastingEffect((context) => ({
                    duration: Duration.WhileSourceInPlay,
                    target: context.player.opponent,
                    effect: abilityHelper.ongoingEffects.blankNamedCardsForPlayer({
                        namedCardTitle: thenContext.select,
                        nonLeadersOnly: true,
                        includeOutOfPlay: true,
                    }),
                }))
            })
        });
    }
}
