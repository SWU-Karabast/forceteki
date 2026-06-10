import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class GorianShardsCorsairPirateWarship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0689229976',
            internalName: 'gorian-shards-corsair#pirate-warship'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Damage dealt by friendly Underworld cards is unpreventable',
            targetZoneFilter: WildcardZoneName.Any,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Any,
            matchTarget: (card) => card.hasSomeTrait(Trait.Underworld),
            ongoingEffect: AbilityHelper.ongoingEffects.damageDealtByThisCardIsUnpreventable()
        });

        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to a unit',
            optional: true,
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
