import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ObiWanKenobiPatientMentor extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2784756758',
            internalName: 'obiwan-kenobi#patient-mentor',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Heal 1 damage from a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 1 })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Heal 1 damage from a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to a different unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== ifYouDoContext.events[0].card,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }
}

