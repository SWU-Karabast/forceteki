import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { ICost } from '../../../core/cost/ICost';

export default class FennecShandReadyForWar extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8844391252',
            internalName: 'fennec-shand#ready-for-war',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        this.addPlayUnitReadyAbility(registrar, abilityHelper, [
            abilityHelper.costs.abilityActivationResourceCost(1),
            abilityHelper.costs.exhaustSelf(),
            abilityHelper.costs.exhaustFriendlyUnit()
        ]);
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        this.addPlayUnitReadyAbility(registrar, abilityHelper, [
            abilityHelper.costs.abilityActivationResourceCost(1),
            abilityHelper.costs.exhaustFriendlyUnit()
        ]);
    }

    private addPlayUnitReadyAbility(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar | ILeaderUnitAbilityRegistrar,
        abilityHelper: IAbilityHelper,
        cost: ICost<AbilityContext<this>>[]
    ): void {
        registrar.addActionAbility({
            title: 'Play a unit from your hand. It enters play ready',
            cost,
            cannotTargetFirst: true,
            targetResolver: {
                activePromptTitle: 'Play a unit from your hand. It enters play ready',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    entersReady: true,
                    playAsType: WildcardCardType.Unit
                })
            }
        });
    }
}
