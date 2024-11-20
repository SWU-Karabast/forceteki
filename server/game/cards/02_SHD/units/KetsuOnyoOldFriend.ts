import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { DamageType } from '../../../core/Constants';

export default class KetsuOnyoOldFriend extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4595532978',
            internalName: 'ketsu-onyo#old-friend',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'When this unit deals combat damage to a base: You may defeat an upgrade that costs 2 or less.',
            when: {
                onDamageDealt: (event, _context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    (event.type === DamageType.Combat &&
                      event.damageSource.attack.target?.isBase()) ||
                      event.type === DamageType.Overwhelm
            },
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
                cardCondition: (card) => card.isUpgrade() && card.cost <= 2,
            }
        });
    }
}

KetsuOnyoOldFriend.implemented = true;
