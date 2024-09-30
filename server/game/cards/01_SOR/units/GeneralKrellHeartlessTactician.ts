import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class GeneralKrellHeartlessTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9353672706',
            internalName: 'general-krell#heartless-tactician',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Other friendly units gain when defeated ability',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Triggered,
                title: 'Draw a card',
                when: { onCardDefeated: (event, context) => event.card === context.source },
                immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            })
        });
    }
}

GeneralKrellHeartlessTactician.implemented = true;
