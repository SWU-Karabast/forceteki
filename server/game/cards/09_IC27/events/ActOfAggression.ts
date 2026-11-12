import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ActOfAggression extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1574377955',
            internalName: 'act-of-aggression',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Draw a card. You may deal 3 damage to a unit. Give a friendly unit +3/+0 and ${TextHelper.Overwhelm} for this phase.`,
            immediateEffect: AbilityHelper.immediateEffects.draw(),
            then: {
                title: 'Deal 3 damage to a unit',
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                },
                then: {
                    title: `Give a friendly unit +3/+0 and ${TextHelper.Overwhelm} for this phase`,
                    targetResolver: {
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: [
                                AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }),
                                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                            ]
                        })
                    }
                }
            }
        });
    }
}
