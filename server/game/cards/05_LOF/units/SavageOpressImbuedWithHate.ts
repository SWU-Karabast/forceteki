import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class SavageOpressImbuedWithHate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1636013021',
            internalName: 'savage-opress#imbued-with-hate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Use the Force. If you don\'t, deal 9 damage to your base.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDoNot: {
                title: 'Deal 9 damage to your base',
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 9,
                    target: context.player.base
                }))
            }
        });
    }
}