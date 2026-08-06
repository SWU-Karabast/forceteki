import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TheStudentGuidesTheMaster extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0002611789',
            internalName: 'the-student-guides-the-master',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a friendly unit +1/+0 for this phase for each other friendly unit with less power than it',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: abilityHelper.ongoingEffects.modifyStats({
                        power: context.player.getArenaUnits({
                            otherThan: context.target,
                            condition: (card) => card.isUnit() && card.getPower() < context.target.getPower()
                        }).length,
                        hp: 0
                    })
                }))
            }
        });
    }
}
