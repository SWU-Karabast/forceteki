import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KitFistoTheSmilingJedi extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1641175580',
            internalName: 'kit-fisto#the-smiling-jedi',
        };
    }

    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Deal 3 damage to a ground unit',
            optional: true,
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}
