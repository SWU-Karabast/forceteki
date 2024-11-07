import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { DamageType } from '../../../gameSystems/DamageSystem';

export default class SeventhSisterImplacableInquisitor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0828695133',
            internalName: 'seventh-sister#implacable-inquisitor',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'When this unit deals combat damage to an opponent’s base: You may deal 3 damage to a ground unit that opponent controls',
            when: {
                onDamageDealt: (event, context) =>
                    event.type === DamageType.Combat &&
                    event.damageSource.attack.target?.isBase()
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                locationFilter: Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
            },
        });
    }
}

SeventhSisterImplacableInquisitor.implemented = true;
