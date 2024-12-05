import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class GuardingTheWay extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2359136621',
            internalName: 'guarding-the-way',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give Sentinel for the phase and optionally +2/+2 if you have initiative',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.source.controller.hasInitiative(),
                        onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                        }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                ])
            }
        });
    }
}

GuardingTheWay.implemented = true;
