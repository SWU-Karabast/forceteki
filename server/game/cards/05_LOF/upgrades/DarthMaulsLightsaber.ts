import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class DarthMaulsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2167393423',
            internalName: 'darth-mauls-lightsaber',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, controller: Player): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle) && targetCard.controller === controller;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attack with Darth Maul. For this attack, he gains overwhelm and can\'t attack bases.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Darth Maul',
                onTrue: AbilityHelper.immediateEffects.attack((attackCtx) => ({
                    target: attackCtx.source.parentCard,
                    targetCondition: (target) => target.isUnit(),
                    optional: false,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                    }
                }))
            })
        });
    }
}