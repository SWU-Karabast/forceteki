import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class HanSoloHasHisMoments extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6720065735',
            internalName: 'han-solo#has-his-moments',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            title: 'Attack with attached unit. If it\'s the Millennium Falcon, it deals its combat damage before the defender.',
            type: AbilityType.Triggered,
            when: {
                whenPlayed: true,
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.attack((context) => ({
                target: context.source.parentCard,
                attackerLastingEffects: [{
                    effect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
                    condition: (attack: Attack) => attack.attacker.title === 'Millennium Falcon'
                }]
            }))
        });
    }
}