import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ZuckussDangerous extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8193186349',
            internalName: 'zuckuss#dangerous',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal damage equal to this unit\'s power to a ground unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isTraitInPlay(Trait.BountyHunter, context.source),
                    onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.source.getPower()
                    }))
                })
            }
        });
    }
}