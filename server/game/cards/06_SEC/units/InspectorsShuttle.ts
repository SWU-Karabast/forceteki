import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class InspectorsShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3789032775',
            internalName: 'inspectors-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Name a card, then an opponent reveals their hand. For each copy of the named card in their hand, give an Experience token to this unit',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
                // skip ability if opponent has no cards in hand
                condition: (context) => context.player.opponent.hand.length > 0
            },
            then: (thenContext) => ({
                title: 'An opponent reveals their hand, for each copy of the named card in their hand, give an Experience token to this unit',
                // skip ability if opponent has no cards in hand
                thenCondition: (context) => context.player.opponent.hand.length > 0,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.opponent.hand,
                        useDisplayPrompt: true
                    })),
                    abilityHelper.immediateEffects.giveExperience((context) => ({
                        target: context.source,
                        amount: context.player.opponent.hand.filter((x) => x.title === thenContext.select).length
                    }))
                ])
            })
        });
    }
}
