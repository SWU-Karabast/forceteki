import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { ZoneName } from '../../../core/Constants';

export default class ItsATrap extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0964312065',
            internalName: 'its-a-trap',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'If an opponent controls more space units than you, ready each space unit you control',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getUnitsInPlay(ZoneName.SpaceArena).length < context.player.opponent.getUnitsInPlay(ZoneName.SpaceArena).length,
                onTrue: AbilityHelper.immediateEffects.ready((context) => {
                    return { target: context.player.getUnitsInPlay(ZoneName.SpaceArena) };
                }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

ItsATrap.implemented = true;
