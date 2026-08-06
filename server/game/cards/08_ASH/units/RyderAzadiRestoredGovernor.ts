import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, Duration, TargetMode } from '../../../core/Constants';

export default class RyderAzadiRestoredGovernor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2346080263',
            internalName: 'ryder-azadi#restored-governor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Name a card',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
            },
            then: (thenContext) => ({
                title: 'While this unit is in play, opponents can\'t play the named card',
                immediateEffect: AbilityHelper.immediateEffects.playerLastingEffect((context) => ({
                    duration: Duration.WhileSourceInPlay,
                    target: context.player.opponent,
                    effect: AbilityHelper.ongoingEffects.playerCannot({
                        cannot: AbilityRestriction.Play,
                        restrictedActionCondition: (context) => context.ability.card.title === thenContext.select,
                    })
                }))
            })
        });
    }
}
