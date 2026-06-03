import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class T6Shuttle1974WithAMentorsDedication extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8889715574',
            internalName: 't6-shuttle-1974#with-a-mentors-dedication',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give another unit +2/+2 for this phase. You may attack with that unit',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    }),
                    abilityHelper.immediateEffects.optional({
                        title: 'Attack with that unit',
                        innerSystem: abilityHelper.immediateEffects.attack()
                    })
                ])
            }
        });
    }
}