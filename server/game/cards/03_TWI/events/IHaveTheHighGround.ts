import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class IHaveTheHighGround extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9399634203',
            internalName: 'i-have-the-high-ground',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a friendly unit. Each enemy unit gets -4/-0 while attacking that unit this phase.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Each enemy unit gets -4/-0 while attacking',
                        type: AbilityType.Constant,
                        targetController: RelativePlayer.Opponent,
                        matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.target === context.source,
                        ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                    })
                })
            }
        });
    }
}
