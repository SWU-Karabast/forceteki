import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardZoneName, Trait } from '../../../core/Constants';

export default class CaptainPhasmaOnMyCommand extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3427170256',
            internalName: 'captain-phasma#on-my-command',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Give another First Order unit +2/+2 for this phase',
            optional: true,
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.FirstOrder),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
