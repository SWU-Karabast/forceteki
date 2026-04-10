import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Contract } from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import type { IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';
import { registerState, stateValue } from '../../GameObjectUtils';
import type { ITriggeredAbilityProps } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';

/**
 * A target unit gains all non-keyword abilities from a source unit.
 *
 * Keywords can be handled separately using the {@link GainKeyword} effect if needed.
 */
@registerState()
export class GainNonKeywordAbilitiesFromUnitEffect extends OngoingEffectValueWrapperBase<IUnitCard> {
    @stateValue() private accessor _abilityUuidsByTargetCard: Map<string, string[]> = new Map();

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
        const gainedAbilityUuids: string[] = [];

        for (const ability of this.sourceUnit.getTriggeredAbilities()) {
            const abilityProps = ability.properties as ITriggeredAbilityProps<InPlayCard>;
            const abilityId = target.addGainedTriggeredAbility({ ...abilityProps, gainAbilitySource: this.sourceUnit });
            gainedAbilityUuids.push(abilityId);
            console.log('Copying ability with id', abilityId, 'to target', target.internalName);
        }

        this._abilityUuidsByTargetCard.set(target.uuid, gainedAbilityUuids);
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertMapHasKey(this._abilityUuidsByTargetCard, target.uuid, `Attempting to unapply gained abilities from ${this.sourceUnit.internalName} to ${target.internalName} multiple times`);

        const gainedAbilityUuids = this._abilityUuidsByTargetCard.get(target.uuid);

        for (const abilityUuid of gainedAbilityUuids) {
            console.log('Removing copied ability with id', abilityUuid, 'from target', target.internalName);
            target.removeGainedTriggeredAbility(abilityUuid);
        }

        this._abilityUuidsByTargetCard.delete(target.uuid);
    }
}
