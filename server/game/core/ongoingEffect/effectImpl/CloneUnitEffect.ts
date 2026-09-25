import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Contract } from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { EffectName } from '../../Constants';
import type { ICardWithStandardAbilitySetup } from '../../card/propertyMixins/StandardAbilitySetup';
import type { IUnitAbilityRegistrar, IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';

import { registerState, stateValue } from '../../GameObjectUtils';

@registerState()
export class CloneUnitEffect extends OngoingEffectValueWrapperBase<ICardWithStandardAbilitySetup<Card>> {
    @stateValue() private accessor _preCloneActionAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
    @stateValue() private accessor _preCloneTriggeredAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
    @stateValue() private accessor _preCloneConstantAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
    @stateValue() private accessor _preClonePreEnterPlayAbilityUuidsByTargetCard: Map<string, string[]> = new Map();

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
        Contract.assertDoesNotHaveKey(this._preCloneActionAbilityUuidsByTargetCard, target.uuid, `Attempting to clone action abilities with ${target.internalName} twice`);
        Contract.assertDoesNotHaveKey(this._preCloneTriggeredAbilityUuidsByTargetCard, target.uuid, `Attempting to clone triggered abilities with ${target.internalName} twice`);
        Contract.assertDoesNotHaveKey(this._preCloneConstantAbilityUuidsByTargetCard, target.uuid, `Attempting to clone constant abilities with ${target.internalName} twice`);
        Contract.assertDoesNotHaveKey(this._preClonePreEnterPlayAbilityUuidsByTargetCard, target.uuid, `Attempting to clone pre-enter play abilities with ${target.internalName} twice`);

        this._preCloneActionAbilityUuidsByTargetCard.set(target.uuid, target.getPrintedActionAbilities().map((ability) => ability.uuid));
        this._preCloneTriggeredAbilityUuidsByTargetCard.set(target.uuid, target.getPrintedTriggeredAbilities().map((ability) => ability.uuid));
        this._preCloneConstantAbilityUuidsByTargetCard.set(target.uuid, target.getPrintedConstantAbilities().map((ability) => ability.uuid));
        this._preClonePreEnterPlayAbilityUuidsByTargetCard.set(target.uuid, target.getPrintedPreEnterPlayAbilities().map((ability) => ability.uuid));

        const clonedUnit = this.getValue();

        // Avoid cloning abilities from the same card to prevent duplication
        if (target.internalName !== clonedUnit.internalName) {
            clonedUnit.setupCardAbilities(target.getAbilityRegistrar() as IUnitAbilityRegistrar<IUnitCard>, this.game.abilityHelper, this.game.gameState);
        }
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertMapHasKey(this._preCloneActionAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply cloned action abilities from ${target.internalName} but it is not applied`);
        Contract.assertMapHasKey(this._preCloneTriggeredAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply cloned triggered abilities from ${target.internalName} but it is not applied`);
        Contract.assertMapHasKey(this._preCloneConstantAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply cloned constant abilities from ${target.internalName} but it is not applied`);
        Contract.assertMapHasKey(this._preClonePreEnterPlayAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply cloned pre-enter play abilities from ${target.internalName} but it is not applied`);

        const preCloneActionAbilityUuids = new Set(this._preCloneActionAbilityUuidsByTargetCard.get(target.uuid));
        if (target.canRegisterActionAbilities()) {
            for (const ability of target.getPrintedActionAbilities().filter((ability) => !preCloneActionAbilityUuids.has(ability.uuid))) {
                target.removePrintedActionAbility(ability.uuid);
            }
        }
        this._preCloneActionAbilityUuidsByTargetCard.delete(target.uuid);

        const preCloneTriggeredAbilityUuids = new Set(this._preCloneTriggeredAbilityUuidsByTargetCard.get(target.uuid));
        if (target.canRegisterTriggeredAbilities()) {
            for (const ability of target.getPrintedTriggeredAbilities().filter((ability) => !preCloneTriggeredAbilityUuids.has(ability.uuid))) {
                target.removePrintedTriggeredAbility(ability.uuid);
            }
        }
        this._preCloneTriggeredAbilityUuidsByTargetCard.delete(target.uuid);

        const preCloneConstantAbilityUuids = new Set(this._preCloneConstantAbilityUuidsByTargetCard.get(target.uuid));
        if (target.canRegisterConstantAbilities()) {
            for (const ability of target.getPrintedConstantAbilities().filter((ability) => !preCloneConstantAbilityUuids.has(ability.uuid))) {
                target.removePrintedConstantAbility(ability.uuid);
            }
        }
        this._preCloneConstantAbilityUuidsByTargetCard.delete(target.uuid);

        const preClonePreEnterPlayAbilityUuids = new Set(this._preClonePreEnterPlayAbilityUuidsByTargetCard.get(target.uuid));
        if (target.canRegisterPreEnterPlayAbilities()) {
            for (const ability of target.getPrintedPreEnterPlayAbilities().filter((ability) => !preClonePreEnterPlayAbilityUuids.has(ability.uuid))) {
                target.removePrintedPreEnterPlayAbility(ability.uuid);
            }
        }
        this._preClonePreEnterPlayAbilityUuidsByTargetCard.delete(target.uuid);
    }
}