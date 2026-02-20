import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class LibertyDrawTheirFire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9963012140',
            internalName: 'liberty#draw-their-fire'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust an enemy unit and return all upgrades on it that cost 4 or less to their owner\'s hands',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            // cannotTargetFirst: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.exhaust(),
                    abilityHelper.immediateEffects.returnToHand((context) => ({
                        target: context.target.upgrades?.filter((x) => x.cost <= 4)
                    }))
                ])
            }
        });
    }
}
