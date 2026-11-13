import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MaceWinduHereWithBackup extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5193918770',
            internalName: 'mace-windu#here-with-backup',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Attack with a unit. It gains ${TextHelper.Restore(2)} for this attack`,
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Restore,
                        amount: 2
                    })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Resource the top card of your deck',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                target: context.player.getTopCardOfDeck()
            }))
        });
    }
}
