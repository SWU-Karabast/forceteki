import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class VigilantDefense extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'vigilant-defense-id',
            internalName: 'vigilant-defense',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Give a friendly unit +0/+3 and ${TextHelper.Sentinel} for this phase. Heal 3 damage from a friendly unit or base. Defeat an enemy unit with 3 or less remaining HP.`,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: [
                        AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 3 }),
                        AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    ]
                })
            },
            then: {
                title: 'Heal 3 damage from a friendly unit or base',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
                },
                then: {
                    title: 'Defeat an enemy unit with 3 or less remaining HP',
                    targetResolver: {
                        controller: RelativePlayer.Opponent,
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                        immediateEffect: AbilityHelper.immediateEffects.defeat()
                    }
                }
            }
        });
    }
}
