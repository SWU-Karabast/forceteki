import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { ICost } from '../../../core/cost/ICost';

export default class ChewbaccaHeroOfKessel extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chewbacca#hero-of-kessel-id',
            internalName: 'chewbacca#hero-of-kessel',
        };
    }

    protected override deployActionAbilityProps(abilityHelper: IAbilityHelper) {
        return {
            condition: () => true,
            cost: () => abilityHelper.costs.abilityActivationResourceCost(4) as ICost<AbilityContext<this>>
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 2 damage to a unit and create a Credit token',
            // need to disable cost reordering because we do not want to lose 1 ready resource
            disableCostReordering: true,
            cost: [
                abilityHelper.costs.abilityActivationResourceCost(1),
                abilityHelper.costs.exhaustSelf(),
                abilityHelper.costs.defeat({
                    zoneFilter: ZoneName.Resource,
                    controller: RelativePlayer.Self,

                })
            ],
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.createCreditToken(),
                abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                })
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat a friendly resource. If you do, deal 2 damage to a unit and create a Credit token',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Deal 2 damage to a unit and create a Credit token',
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.createCreditToken(),
                    abilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                    })
                ])
            }
        });
    }
}