import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { IGameStateGetter } from '../../../core/lki/GameStateGetter';

export default class TargetedForRemoval extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6727831575',
            internalName: 'targeted-for-removal',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper, gameState: IGameStateGetter) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'An opponent creates Credit tokens equal to this unit\'s cost',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken((context) => ({
                // The attached unit's cost as of the moment it left play.
                amount: gameState.getLastKnownProperties(context.event.card).asUnit().cost,
                target: context.player.opponent
            }))
        });
    }
}