import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import * as Contract from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { EffectName } from '../../Constants';
import type { ICardWithStandardAbilitySetup } from '../../card/propertyMixins/StandardAbilitySetup';
import type { IUnitAbilityRegistrar, IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type Game from '../../Game';

export class CloneUnitEffect extends OngoingEffectValueWrapper<ICardWithStandardAbilitySetup<Card>> {
    private printedActionAbilitiesUuidByTargetCard?: Set<string>;
    private printedTriggeredAbilitiesUuidByTargetCard?: Set<string>;
    private printedConstantAbilitiesUuidByTargetCard?: Set<string>;
    private printedPreEnterPlayAbilitiesUuidByTargetCard?: Set<string>;

    public constructor(game: Game, clonedUnit: Card) {
        // If we are cloning a unit that is itself a clone, we need to find the original unit
        // to ensure that we clone the correct abilities
        while (clonedUnit.hasOngoingEffect(EffectName.CloneUnit)) {
            clonedUnit = clonedUnit.getOngoingEffectValues<Card>(EffectName.CloneUnit)[0];
        }

        const effectDescription: FormatMessage = {
            format: 'clone {0}',
            args: [clonedUnit]
        };

        Contract.assertTrue(clonedUnit.isUnit(), 'Only units can be cloned');
        Contract.assertTrue(clonedUnit.hasStandardAbilitySetup(), 'Only units with standard ability setup can be cloned');

        super(game, clonedUnit, effectDescription);
    }

    public override apply(target: IUnitCard): void {
        super.apply(target);

        Contract.assertTrue(target.isClone(), 'CloneUnitEffect can only be use to clone a Clone');
        Contract.assertIsNullLike(this.printedActionAbilitiesUuidByTargetCard, `Attempting to clone action abilities with ${target.internalName} twice`);
        Contract.assertIsNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to clone triggered abilities with ${target.internalName} twice`);
        Contract.assertIsNullLike(this.printedConstantAbilitiesUuidByTargetCard, `Attempting to clone constant abilities with ${target.internalName} twice`);
        Contract.assertIsNullLike(this.printedPreEnterPlayAbilitiesUuidByTargetCard, `Attempting to clone pre-enter play abilities with ${target.internalName} twice`);

        this.printedActionAbilitiesUuidByTargetCard = new Set(target.getPrintedActionAbilities().map((ability) => ability.uuid));
        this.printedTriggeredAbilitiesUuidByTargetCard = new Set(target.getPrintedTriggeredAbilities().map((ability) => ability.uuid));
        this.printedConstantAbilitiesUuidByTargetCard = new Set(target.getPrintedConstantAbilities().map((ability) => ability.uuid));
        this.printedPreEnterPlayAbilitiesUuidByTargetCard = new Set(target.getPrintedPreEnterPlayAbilities().map((ability) => ability.uuid));

        const clonedUnit = this.getValue();

        // Avoid cloning abilities from the same card to prevent duplication
        if (target.internalName !== clonedUnit.internalName) {
            clonedUnit.setupCardAbilities(target.getAbilityRegistrar() as IUnitAbilityRegistrar<IUnitCard>, this.game.abilityHelper);
        }
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertNotNullLike(this.printedActionAbilitiesUuidByTargetCard, `Attempting to unapply cloned action abilities from ${target.internalName} but it is not applied`);
        Contract.assertNotNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to unapply cloned triggered abilities from ${target.internalName} but it is not applied`);
        Contract.assertNotNullLike(this.printedConstantAbilitiesUuidByTargetCard, `Attempting to unapply cloned constant abilities from ${target.internalName} but it is not applied`);
        Contract.assertNotNullLike(this.printedPreEnterPlayAbilitiesUuidByTargetCard, `Attempting to unapply cloned pre-enter play abilities from ${target.internalName} but it is not applied`);

        if (target.canRegisterActionAbilities()) {
            for (const ability of target.getPrintedActionAbilities().filter((ability) => !(this.printedActionAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid))) {
                target.removePrintedActionAbility(ability.uuid);
            }
        }
        this.printedActionAbilitiesUuidByTargetCard = undefined;

        if (target.canRegisterTriggeredAbilities()) {
            for (const ability of target.getPrintedTriggeredAbilities().filter((ability) => !(this.printedTriggeredAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid))) {
                target.removePrintedTriggeredAbility(ability.uuid);
            }
        }
        this.printedTriggeredAbilitiesUuidByTargetCard = undefined;

        if (target.canRegisterConstantAbilities()) {
            for (const ability of target.getPrintedConstantAbilities().filter((ability) => !(this.printedConstantAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid))) {
                target.removePrintedConstantAbility(ability.uuid);
            }
        }
        this.printedConstantAbilitiesUuidByTargetCard = undefined;

        if (target.canRegisterPreEnterPlayAbilities()) {
            for (const ability of target.getPrintedConstantAbilities().filter((ability) => !(this.printedPreEnterPlayAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid))) {
                target.removePrintedPreEnterPlayAbility(ability.uuid);
            }
        }
        this.printedPreEnterPlayAbilitiesUuidByTargetCard = undefined;
    }
}