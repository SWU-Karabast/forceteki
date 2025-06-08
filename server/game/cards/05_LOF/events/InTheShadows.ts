import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, TargetMode } from '../../../core/Constants';

export default class InTheShadows extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6553590382',
            internalName: 'in-the-shadows',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give an experience token to up to 3 friendly units with Hidden',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardCondition: (card, context) => card.isUnit() && card.hasSomeKeyword(KeywordName.Hidden) && card.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}