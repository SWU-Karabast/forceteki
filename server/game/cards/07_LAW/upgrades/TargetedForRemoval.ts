import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { ICardStateGetter } from '../../../core/lki/CardStateGetter';

export default class TargetedForRemoval extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6727831575',
            internalName: 'targeted-for-removal',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper, cardStates: ICardStateGetter) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'An opponent creates Credit tokens equal to this unit\'s cost',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken((context) => ({
                // The attached unit's cost as of the moment it left play. Read through the
                // event-bound reference so a unit that has since moved on still resolves to the
                // identity this ability fired on (SC-13).
                amount: cardStates.getLastKnownProperties(context.event.cardRef).asUnitCard().cost,
                target: context.player.opponent
            }))
        });
    }
}