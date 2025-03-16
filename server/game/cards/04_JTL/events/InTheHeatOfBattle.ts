import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName } from '../../../core/Constants';

export default class InTheHeatOfBattle extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3272995563',
            internalName: 'in-the-heat-of-battle',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Each unit gains Sentinel and loses Saboteur for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.game.getArenaUnits(),
                effect: [
                    AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
                    AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Saboteur)
                ]
            }))
        });
    }
}
