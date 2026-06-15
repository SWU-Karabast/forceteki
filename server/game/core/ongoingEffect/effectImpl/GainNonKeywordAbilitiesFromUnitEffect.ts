import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Contract } from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import type { IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';
import { registerState, stateValue } from '../../GameObjectUtils';
import type { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';

/**
 * A target unit gains all non-keyword abilities from a source unit.
 *
 * Keywords can be handled separately using the {@link GainKeyword} effect if needed.
 */
@registerState()
export class GainNonKeywordAbilitiesFromUnitEffect extends OngoingEffectValueWrapperBase<IUnitCard> {
    @stateValue() private accessor _triggeredAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
    @stateValue() private accessor _actionAbilityUuidsByTargetCard: Map<string, string[]> = new Map();
    @stateValue() private accessor _constantAbilityUuidsByTargetCard: Map<string, string[]> = new Map();

    private get sourceUnit(): IUnitCard {
        return this.getValue();
    }

    public constructor(game: Game, sourceUnit: Card) {
        const effectDescription: FormatMessage = {
            format: 'give {0}\'s abilities',
            args: [sourceUnit]
        };

        Contract.assertTrue(sourceUnit.isUnit(), `Only units can have their abilities copied, attempted to copy from ${sourceUnit.internalName}`);

        super(game, sourceUnit, effectDescription);
    }

    public override apply(target: IUnitCard): void {
        super.apply(target);

        Contract.assertDoesNotHaveKey(this._triggeredAbilityUuidsByTargetCard, target.uuid, `Attempting to apply gained triggered abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);
        Contract.assertDoesNotHaveKey(this._actionAbilityUuidsByTargetCard, target.uuid, `Attempting to apply gained action abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);
        Contract.assertDoesNotHaveKey(this._constantAbilityUuidsByTargetCard, target.uuid, `Attempting to apply gained constant abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);

        // This covers Triggered, Replacement, and Damage Modification abilities
        const triggeredAbilityUuids = this.sourceUnit.getTriggeredAbilities()
            .map((ability) => {
                const abilityProps = ability.properties as ITriggeredAbilityProps<InPlayCard>;
                return target.addGainedTriggeredAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
            });

        const actionAbilityUuids = this.sourceUnit.getActionAbilities()
            .map((ability) => {
                const abilityProps = ability.properties as IActionAbilityProps<InPlayCard>;
                return target.addGainedActionAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
            });

        const constantAbilityUuids = this.sourceUnit.getConstantAbilities()
            .map((ability) => {
                const abilityProps = ability.properties as IConstantAbilityProps<InPlayCard>;
                return target.addGainedConstantAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
            });

        this._triggeredAbilityUuidsByTargetCard.set(target.uuid, triggeredAbilityUuids);
        this._actionAbilityUuidsByTargetCard.set(target.uuid, actionAbilityUuids);
        this._constantAbilityUuidsByTargetCard.set(target.uuid, constantAbilityUuids);
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertMapHasKey(this._triggeredAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply gained triggered abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);
        Contract.assertMapHasKey(this._actionAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply gained action abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);
        Contract.assertMapHasKey(this._constantAbilityUuidsByTargetCard, target.uuid, `Attempting to unapply gained constant abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);

        const triggeredAbilityUuids = this._triggeredAbilityUuidsByTargetCard.get(target.uuid);
        const actionAbilityUuids = this._actionAbilityUuidsByTargetCard.get(target.uuid);
        const constantAbilityUuids = this._constantAbilityUuidsByTargetCard.get(target.uuid);

        for (const abilityUuid of triggeredAbilityUuids) {
            target.removeGainedTriggeredAbility(abilityUuid);
        }

        for (const abilityUuid of actionAbilityUuids) {
            target.removeGainedActionAbility(abilityUuid);
        }

        for (const abilityUuid of constantAbilityUuids) {
            target.removeGainedConstantAbility(abilityUuid);
        }

        this._triggeredAbilityUuidsByTargetCard.delete(target.uuid);
        this._actionAbilityUuidsByTargetCard.delete(target.uuid);
        this._constantAbilityUuidsByTargetCard.delete(target.uuid);
    }
}
