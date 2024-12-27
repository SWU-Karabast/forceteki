import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class KrakenConfederateTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7979348081',
            internalName: 'kraken#confederate-tactician'
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Create 2 Battle Droid tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });

        this.addOnAttackAbility({
            title: 'Give each friendly token unit +1/+1 for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.controller.getUnitsInPlay().filter((card) => card.type === CardType.TokenUnit),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
            })),
        });
    }
}

KrakenConfederateTactician.implemented = true;
