import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode } from '../../../core/Constants';
import { asConcretePlayer } from '../../../core/utils/EnumHelpers';

export default class Watchful extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6533680901',
            internalName: 'watchful'
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Look at the top card of a deck. You may put it on the bottom of that deck.',
            targetResolver: {
                activePromptTitle: 'Look at the top card of a deck',
                mode: TargetMode.Player,
                effectChoices: (relativePlayer, context) => (asConcretePlayer(relativePlayer, context.player) === context.player
                    ? 'Your deck'
                    : 'Opponent\'s deck'),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.drawDeck.length > 0 || context.player.opponent.drawDeck.length > 0,
                    onTrue: AbilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 1 })
                })
            }
        });
    }
}