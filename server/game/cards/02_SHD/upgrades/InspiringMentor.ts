import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class InspiringMentor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6775521270',
            internalName: 'inspiring-mentor',
        };
    }

    public override setupCardAbilities() {
        this.disableWhenDefeatedCheck = true;

        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainTriggeredAbilityTargetingAttached({
            title: 'Give an Experience token to another friendly unit',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
