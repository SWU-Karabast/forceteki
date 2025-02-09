import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BlackSquadronScoutWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6354077246',
            internalName: 'black-squadron-scout-wing',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Attack with this unit. It gets +1/+0 for this attack.',
            when: {
                onCardPlayed: (event, context) => event.card.controller === context.player &&
                  event.card.isUpgrade() &&
                  event.attachTarget === context.source
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.attack({
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                }
            })
        });
    }
}
