import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Contract } from '../../../core/utils/Contract';

export default class TargetedForRemoval extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6727831575',
            internalName: 'targeted-for-removal',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'An opponent creates Credit tokens equal to this unit\'s cost',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken((context) => ({
                amount: this.costWhenDefeated(context),
                target: context.player.opponent
            }))
        });
    }

    /** The attached unit's cost as of the moment it left play. */
    private costWhenDefeated(context: TriggeredAbilityContext): number {
        const { cost } = this.gameState.getPropertiesOrLki(context.event.card);

        Contract.assertNotNullLike(cost, 'Expected the defeated unit to have a cost');
        return cost;
    }
}