import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class TheDarksaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3141660491',
            internalName: 'the-darksaber',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to each other friendly Mandalorian unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => {
                const mandalorians = context.player.getUnitsInPlay().filter((unit) => unit.hasSomeTrait(Trait.Mandalorian) && unit !== context.source);
                return { target: mandalorians };
            })
        });

        this.addIgnoreAllAspectPenaltiesAbility({
            title: 'Ignore aspect penalties while playing this on a Mandalorian',
            attachTargetCondition: (attachTarget) => attachTarget.hasSomeTrait(Trait.Mandalorian)
        });
    }
}

TheDarksaber.implemented = true;
