import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DefiantScrapper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3108628614',
            internalName: 'defiant-scrapper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat an enemy Credit token',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.opponent.creditTokenCount > 0,
                onTrue: AbilityHelper.immediateEffects.defeat({
                    target: context.player.opponent.baseZone.credits[0]
                })
            }))
        });
    }
}