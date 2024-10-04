import AbilityHelper from '../../../AbilityHelper';
import { InPlayCard } from '../../../core/card/baseClasses/InPlayCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';
import { CardType, Location, RelativePlayer, WildcardCardType, WildcardLocation } from '../../../core/Constants';

export default class LeiaOrganaDefiantPrincess extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9680213078',
            internalName: 'leia-organa#defiant-princess'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Ready a resource or exhaust a unit',
            targetResolver: {
                locationFilter: [Location.Resource, WildcardLocation.AnyArena],
                cardCondition: (card) =>
                    (card.location === Location.Resource && (card as InPlayCard).exhausted === true) ||
                    (EnumHelpers.isArena(card.location) && (card as InPlayCard).exhausted === false),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.location === Location.Resource,
                    onTrue: AbilityHelper.immediateEffects.ready(),
                    onFalse: AbilityHelper.immediateEffects.exhaust()
                })
            }
        });
    }
}

LeiaOrganaDefiantPrincess.implemented = true;