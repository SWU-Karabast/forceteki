import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class TheDarksaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3141660491',
            internalName: 'the-darksaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to each other friendly Mandalorian unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => {
                const mandalorians = context.player.getArenaUnits().filter((unit) => unit.hasSomeTrait(Trait.Mandalorian) && unit !== context.source);
                return { target: mandalorians };
            })
        });

        registrar.addIgnoreAllAspectPenaltiesAbility({
            title: 'Ignore aspect penalties while playing this on a Mandalorian',
            attachTargetCondition: (attachTarget) => attachTarget.hasSomeTrait(Trait.Mandalorian)
        });
    }
}
