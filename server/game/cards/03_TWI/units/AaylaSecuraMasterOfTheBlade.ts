import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageType } from '../../../core/Constants';

export default class AaylaSecuraMasterOfTheBlade extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6190335038',
            internalName: 'aayla-secura#master-of-the-blade',
        };
    }
    
    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: "Prevent all combat damage that would be dealt to this unit for this attack.",
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.source,
                effect: AbilityHelper.ongoingEffects.gainAbility({
                    title: "Prevent all combat damage that would be dealt to this unit",
                    type: AbilityType.ReplacementEffect,
                    when: {
                        onDamageDealt: (event, context) => 
                            event.card === context.source && event.type === DamageType.Combat
                    },
                    replaceWith: {
                        target: context.source,
                        replacementImmediateEffect: null
                    }
                }),
            })),
        });
    }
}

AaylaSecuraMasterOfTheBlade.implemented = true;
