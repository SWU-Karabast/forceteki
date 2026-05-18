import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MandosN1StarfighterFasterThanAFathier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mandos-n1-starfighter#faster-than-a-fathier-id',
            internalName: 'mandos-n1-starfighter#faster-than-a-fathier',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust a friendly leader. If you do, this unit gets +2/+0 for this attack',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.canBeExhausted() && !card.exhausted && card.isLeader(),
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'This unit gets +2/+0 for this attack',
                immediateEffect: abilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }
}