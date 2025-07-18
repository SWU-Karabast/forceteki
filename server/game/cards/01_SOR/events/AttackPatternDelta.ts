import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AttackPatternDelta extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1939951561',
            internalName: 'attack-pattern-delta',
        };
    }

    /**
     * Build an immediate effect that modifies power and hp for the phase equal to the passed
     * modification amount.
     * @param modificationAmount The amount to increase power and hp by.
     * @returns The effect.
     */
    private buildModifyStatsForPhaseImmediateEffect(modificationAmount: number, AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.forThisPhaseCardEffect({
            effect: AbilityHelper.ongoingEffects.modifyStats({ power: modificationAmount, hp: modificationAmount }),
        });
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a friendly unit +3/+3 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: this.buildModifyStatsForPhaseImmediateEffect(3, AbilityHelper),
            },
            then: (firstThenContext) => ({
                title: 'Give another friendly unit +2/+2 for this phase.',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => firstThenContext.target !== card,
                    controller: RelativePlayer.Self,
                    immediateEffect: this.buildModifyStatsForPhaseImmediateEffect(2, AbilityHelper),
                },
                then: (secondThenContext) => ({
                    title: 'Give a third friendly unit +1/+1 for this phase.',
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => firstThenContext.target !== card && secondThenContext.target !== card,
                        controller: RelativePlayer.Self,
                        immediateEffect: this.buildModifyStatsForPhaseImmediateEffect(1, AbilityHelper),
                    },
                })
            })
        });
    }
}
