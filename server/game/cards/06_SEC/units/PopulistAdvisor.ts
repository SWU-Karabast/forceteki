import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, KeywordName } from '../../../core/Constants';

export default class PopulistAdvisor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'populist-advisor-id',
            internalName: 'populist-advisor',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'This unit gains Sentinel for this phase',
            when: {
                onDamageDealt: (event, context) =>
                    event.damageSource?.attack?.attacker?.controller !== context.player &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target === context.player.base)) ||
                      event.type === DamageType.Overwhelm)
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            })
        });
    }
}