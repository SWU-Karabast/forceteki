import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import * as Contract from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { StandardTriggeredAbilityType } from '../../Constants';
import type { ICardWithStandardAbilitySetup } from '../../card/propertyMixins/StandardAbilitySetup';
import type { IUnitAbilityRegistrar, IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';

import { registerState } from '../../GameObjectUtils';

const abilityTypeToRegistrarMethod: Record<StandardTriggeredAbilityType, string> = {
    [StandardTriggeredAbilityType.WhenPlayed]: 'addWhenPlayedAbility',
    [StandardTriggeredAbilityType.WhenPlayedUsingSmuggle]: 'addWhenPlayedAbility',
    [StandardTriggeredAbilityType.WhenDefeated]: 'addWhenDefeatedAbility',
    [StandardTriggeredAbilityType.OnAttack]: 'addOnAttackAbility',
    [StandardTriggeredAbilityType.OnDefense]: 'addOnDefenseAbility',
};

const abilityTypeDisplayName: Record<StandardTriggeredAbilityType, string> = {
    [StandardTriggeredAbilityType.WhenPlayed]: 'When Played',
    [StandardTriggeredAbilityType.WhenPlayedUsingSmuggle]: 'When Played',
    [StandardTriggeredAbilityType.WhenDefeated]: 'When Defeated',
    [StandardTriggeredAbilityType.OnAttack]: 'On Attack',
    [StandardTriggeredAbilityType.OnDefense]: 'On Defense',
};

@registerState()
export class CopyStandardTriggeredAbilitiesEffect extends OngoingEffectValueWrapperBase<ICardWithStandardAbilitySetup<Card>> {
    private printedTriggeredAbilitiesUuidByTargetCard?: Set<string>;
    private readonly abilityType: StandardTriggeredAbilityType;

    public constructor(game: Game, sourceUnit: Card, abilityType: StandardTriggeredAbilityType) {
        const effectDescription: FormatMessage = {
            format: `copy the "${abilityTypeDisplayName[abilityType]}" abilities of {0}`,
            args: [sourceUnit]
        };

        Contract.assertTrue(sourceUnit.isUnit(), 'Only units can have their triggered abilities copied');
        Contract.assertTrue(sourceUnit.hasStandardAbilitySetup(), 'Only units with standard ability setup can have their triggered abilities copied');

        super(game, sourceUnit, effectDescription);

        this.abilityType = abilityType;
    }

    public override apply(target: IUnitCard): void {
        super.apply(target);

        Contract.assertIsNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to copy triggered abilities to ${target.internalName} twice`);

        // Snapshot existing triggered ability UUIDs on the target before copying
        this.printedTriggeredAbilitiesUuidByTargetCard = new Set(
            target.getPrintedTriggeredAbilities().map((ability) => ability.uuid)
        );

        const sourceUnit = this.getValue();

        // Access the target's registrar. Cards using this effect must expose getAbilityRegistrar() publicly
        // (following the same pattern as Clone).
        const realRegistrar = (target as unknown as { getAbilityRegistrar(): IUnitAbilityRegistrar<IUnitCard> }).getAbilityRegistrar();
        const filteredRegistrar = this.createFilteredRegistrar(realRegistrar);

        // Call the source unit's setupCardAbilities with the filtered registrar,
        // so only the matching triggered abilities get registered on the target
        sourceUnit.setupCardAbilities(filteredRegistrar, this.game.abilityHelper);
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertNotNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to unapply copied triggered abilities from ${target.internalName} but it is not applied`);

        if (target.canRegisterTriggeredAbilities()) {
            for (const ability of target.getPrintedTriggeredAbilities().filter(
                (ability) => !(this.printedTriggeredAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid)
            )) {
                target.removePrintedTriggeredAbility(ability.uuid);
            }
        }
        this.printedTriggeredAbilitiesUuidByTargetCard = undefined;
    }

    /**
     * Creates a registrar where only the registrar methods related to the configured
     * StandardTriggeredAbilityType pass through. All other methods are no-ops.
     *
     * This handles two registration paths:
     * 1. Shorthand methods (e.g., addWhenPlayedAbility) - passed through directly
     * 2. addTriggeredAbility - intercepted to filter the `when` object so only
     *    matching trigger types are registered (e.g., strips onAttack from a
     *    combined whenPlayed/onAttack ability)
     */
    private createFilteredRegistrar(realRegistrar: IUnitAbilityRegistrar<IUnitCard>): IUnitAbilityRegistrar<IUnitCard> {
        const noop = (() => null) as any;
        const allowedShorthandMethod = abilityTypeToRegistrarMethod[this.abilityType];
        const matchingTriggerKeys = this.getMatchingTriggerKeys();

        const registrarKeys = Object.keys(realRegistrar) as (keyof typeof realRegistrar)[];
        const filteredEntries = registrarKeys.map((key) => {
            // Allow the shorthand method for this ability type (e.g., addWhenPlayedAbility)
            if (key === allowedShorthandMethod) {
                return [key, realRegistrar[key]];
            }

            // Intercept addTriggeredAbility to filter trigger types
            if (key === 'addTriggeredAbility') {
                return [key, (props: any) => {
                    if (!props.when) {
                        return null;
                    }
                    const hasMatch = matchingTriggerKeys.some((triggerKey) => props.when[triggerKey]);
                    if (!hasMatch) {
                        return null;
                    }
                    // Filter the when object to only include matching triggers
                    const filteredWhen: Record<string, any> = {};
                    for (const triggerKey of matchingTriggerKeys) {
                        if (props.when[triggerKey] !== undefined) {
                            filteredWhen[triggerKey] = props.when[triggerKey];
                        }
                    }
                    return (realRegistrar as any).addTriggeredAbility({ ...props, when: filteredWhen });
                }];
            }

            // Block all other methods
            return [key, noop];
        });

        return Object.fromEntries(filteredEntries) as unknown as IUnitAbilityRegistrar<IUnitCard>;
    }

    /**
     * Returns the trigger key names in the `when` object that correspond to this effect's ability type.
     * WhenPlayed and WhenPlayedUsingSmuggle are treated as the same category.
     */
    private getMatchingTriggerKeys(): string[] {
        switch (this.abilityType) {
            case StandardTriggeredAbilityType.WhenPlayed:
            case StandardTriggeredAbilityType.WhenPlayedUsingSmuggle:
                return ['whenPlayed', 'whenPlayedUsingSmuggle'];
            case StandardTriggeredAbilityType.WhenDefeated:
                return ['whenDefeated'];
            case StandardTriggeredAbilityType.OnAttack:
                return ['onAttack'];
            case StandardTriggeredAbilityType.OnDefense:
                return ['onDefense'];
        }
    }
}
