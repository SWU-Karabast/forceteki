import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Location, Trait } from '../../../core/Constants';

export default class FallenLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0160548661',
            internalName: 'fallen-lightsaber',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 1 damage to each ground unit the defending player controls',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                return { target: context.source.controller.opponent.getUnitsInPlay(Location.GroundArena), amount: 1 };
            }),
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force)
        });
    }
}

FallenLightsaber.implemented = true;
