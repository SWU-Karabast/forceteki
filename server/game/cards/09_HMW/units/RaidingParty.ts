import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class RaidingParty extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'raiding-party-id',
            internalName: 'raiding-party',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust a ground unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine) || context.player.hasSomeArenaUnit({ trait: Trait.Tusken, otherThan: context.source }),
                    onTrue: abilityHelper.immediateEffects.exhaust()
                })
            }
        });
    }
}