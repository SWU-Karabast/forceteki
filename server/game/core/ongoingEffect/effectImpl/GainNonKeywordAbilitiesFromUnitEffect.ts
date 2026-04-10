import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Contract } from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import type { IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';
import { registerState, stateValue } from '../../GameObjectUtils';
import type { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import { AbilityType } from '../../Constants';

/**
 * A target unit gains all non-keyword abilities from a source unit.
 *
 * Keywords can be handled separately using the {@link GainKeyword} effect if needed.
 */
@registerState()
export class GainNonKeywordAbilitiesFromUnitEffect extends OngoingEffectValueWrapperBase<IUnitCard> {
    @stateValue() private accessor _abilityUuidsByTargetCard: Map<string, Map<AbilityType, string[]>> = new Map();

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

        Contract.assertDoesNotHaveKey(this._abilityUuidsByTargetCard, target.uuid, `Attempting to apply gained abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);

        const gainedAbilityUuidsByType = new Map<AbilityType, string[]>();

        // This covers Triggered, Replacement, and Damage Modification abilities
        gainedAbilityUuidsByType.set(AbilityType.Triggered,
            this.sourceUnit.getTriggeredAbilities()
                .map((ability) => {
                    const abilityProps = ability.properties as ITriggeredAbilityProps<InPlayCard>;
                    return target.addGainedTriggeredAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
                })
        );

        gainedAbilityUuidsByType.set(AbilityType.Action,
            this.sourceUnit.getActionAbilities()
                .map((ability) => {
                    const abilityProps = ability.properties as IActionAbilityProps<InPlayCard>;
                    return target.addGainedActionAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
                })
        );

        gainedAbilityUuidsByType.set(AbilityType.Constant,
            this.sourceUnit.getConstantAbilities()
                .map((ability) => {
                    const abilityProps = ability.properties as IConstantAbilityProps<InPlayCard>;
                    return target.addGainedConstantAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
                })
        );

        this._abilityUuidsByTargetCard.set(target.uuid, gainedAbilityUuidsByType);
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertMapHasKey(this._abilityUuidsByTargetCard, target.uuid, `Attempting to unapply gained abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);

        const gainedAbilityUuidsByType = this._abilityUuidsByTargetCard.get(target.uuid);

        for (const [abilityType, abilityUuids] of gainedAbilityUuidsByType.entries()) {
            for (const abilityUuid of abilityUuids) {
                switch (abilityType) {
                    case AbilityType.Triggered:
                        target.removeGainedTriggeredAbility(abilityUuid);
                        break;
                    case AbilityType.Action:
                        target.removeGainedActionAbility(abilityUuid);
                        break;
                    case AbilityType.Constant:
                        target.removeGainedConstantAbility(abilityUuid);
                        break;
                    default:
                        Contract.fail(`Unsupported ability type ${abilityType} found when removing gained abilities from ${this.sourceUnit.internalName} to ${target.internalName}`);
                }
            }
        }

        this._abilityUuidsByTargetCard.delete(target.uuid);
    }
}
