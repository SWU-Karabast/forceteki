import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode } from '../../../core/Constants';

export default class StolenStarpathUnit extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'stolen-starpath-unit-id',
            internalName: 'stolen-starpath-unit',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Name a card, reveal opponent\'s hand, and create a Spy token for each card with that name',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
                condition: (context) => context.player.opponent.hand.length > 0   // skip ability if opponent has no cards in hand
            },
            then: (thenContext) => ({
                title: 'An opponent reveals their hand. Create a Spy token for each card in their hand with that name',
                thenCondition: (context) => context.player.opponent.hand.length > 0,   // skip ability if opponent has no cards in hand
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.opponent.hand,
                        useDisplayPrompt: true
                    })),
                    abilityHelper.immediateEffects.createSpy((context) => ({
                        amount: context.player.opponent.hand.filter((x) => x.title === thenContext.select).length,
                    }))
                ])
            })
        });
    }
}
