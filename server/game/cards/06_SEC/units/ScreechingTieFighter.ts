import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ScreechingTieFighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'screeching-tie-fighter-id',
            internalName: 'screeching-tie-fighter',
        };
    }

    public override setupCardAbilities(
        registrar: INonLeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addOnAttackAbility({
            title: 'Select a Ground unit to lose all Keywords for this phase',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseKeyword(Object.values(KeywordName)),
                    ongoingEffectDescription: 'remove all Keywords from',
                })
            }
        });
    }
}