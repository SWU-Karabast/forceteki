import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DisplayPiece extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8875606707',
            internalName: 'display-piece',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat an enemy non-leader unit. Its controller resources it from its owner\'s discard pile',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Defeat an enemy non-leader unit. Its controller resources it from its owner\'s discard pile',
                ifYouDoCondition: () => ifYouDoContext.target.zoneName === ZoneName.Discard,
                immediateEffect: abilityHelper.immediateEffects.resourceCard({
                    target: ifYouDoContext.target,
                    targetPlayer: RelativePlayer.Opponent
                })
            })
        });
    }
}