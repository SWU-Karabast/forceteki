import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BlackOneStraightAtThem extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3389903389',
            internalName: 'black-one#straight-at-them'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While this unit is upgraded, it gets +1/+0.',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Poe Dameron'),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 })
                })
            }
        });
    }
}