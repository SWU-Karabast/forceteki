import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class FallenLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0160548661',
            internalName: 'fallen-lightsaber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        card.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 1 damage to each ground unit the defending player controls',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) =>
                ({ target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena }), amount: 1 })
            ),
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force)
        });
    }
}
