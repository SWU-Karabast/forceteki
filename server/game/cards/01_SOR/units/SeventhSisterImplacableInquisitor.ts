import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';


export default class SeventhSisterImplacableInquisitor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0828695133',
            internalName: 'seventh-sister#implacable-inquisitor',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 3 damage to a ground unit that opponent controls',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.target?.isBase()) || event.type === DamageType.Overwhelm)
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
            },
        });
    }
}
