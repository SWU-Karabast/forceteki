import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SilverAngelTracesHope extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8352777268',
            internalName: 'silver-angel#traces-hope',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to a space unit',
            when: {
                onDamageHealed: (event, context) => event.card === context.source
            },
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
