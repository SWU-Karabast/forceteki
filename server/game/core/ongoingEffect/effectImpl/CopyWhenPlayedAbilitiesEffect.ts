import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import * as Contract from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import type { ICardWithStandardAbilitySetup } from '../../card/propertyMixins/StandardAbilitySetup';
import type { IUnitAbilityRegistrar, IUnitCard } from '../../card/propertyMixins/UnitProperties';
import type { Game } from '../../Game';

import { registerState } from '../../GameObjectUtils';

@registerState()
export class CopyWhenPlayedAbilitiesEffect extends OngoingEffectValueWrapperBase<ICardWithStandardAbilitySetup<Card>> {
    private printedTriggeredAbilitiesUuidByTargetCard?: Set<string>;

    public constructor(game: Game, sourceUnit: Card) {
        const effectDescription: FormatMessage = {
            format: 'copy When Played abilities from {0}',
            args: [sourceUnit]
        };

        Contract.assertTrue(sourceUnit.isUnit(), 'Only units can have their When Played abilities copied');
        Contract.assertTrue(sourceUnit.hasStandardAbilitySetup(), 'Only units with standard ability setup can have their When Played abilities copied');

        super(game, sourceUnit, effectDescription);
    }

    public override apply(target: IUnitCard): void {
        super.apply(target);

        Contract.assertIsNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to copy When Played abilities to ${target.internalName} twice`);

        // Snapshot existing triggered ability UUIDs on the target before copying
        this.printedTriggeredAbilitiesUuidByTargetCard = new Set(
            target.getPrintedTriggeredAbilities().map((ability) => ability.uuid)
        );

        const sourceUnit = this.getValue();

        // Access the target's registrar. Cards using this effect must expose getAbilityRegistrar() publicly
        // (following the same pattern as Clone).
        const realRegistrar = (target as unknown as { getAbilityRegistrar(): IUnitAbilityRegistrar<IUnitCard> }).getAbilityRegistrar();
        const filteredRegistrar = this.createWhenPlayedOnlyRegistrar(realRegistrar);

        // Call the source unit's setupCardAbilities with the filtered registrar,
        // so only When Played abilities get registered on the target
        sourceUnit.setupCardAbilities(filteredRegistrar, this.game.abilityHelper);
    }

    /**
     * Creates a registrar where only addWhenPlayedAbility passes through to the real registrar.
     * All other registration methods are no-ops.
     */
    private createWhenPlayedOnlyRegistrar(realRegistrar: IUnitAbilityRegistrar<IUnitCard>): IUnitAbilityRegistrar<IUnitCard> {
        const noop = (() => null) as any;

        const registrarKeys = Object.keys(realRegistrar) as (keyof typeof realRegistrar)[];
        const filteredEntries = registrarKeys.map((key) => [
            key,
            key === 'addWhenPlayedAbility' ? realRegistrar[key] : noop
        ]);

        return Object.fromEntries(filteredEntries) as unknown as IUnitAbilityRegistrar<IUnitCard>;
    }

    public override unapply(target: IUnitCard): void {
        super.unapply(target);

        Contract.assertNotNullLike(this.printedTriggeredAbilitiesUuidByTargetCard, `Attempting to unapply copied When Played abilities from ${target.internalName} but it is not applied`);

        if (target.canRegisterTriggeredAbilities()) {
            for (const ability of target.getPrintedTriggeredAbilities().filter(
                (ability) => !(this.printedTriggeredAbilitiesUuidByTargetCard ?? new Set()).has(ability.uuid)
            )) {
                target.removePrintedTriggeredAbility(ability.uuid);
            }
        }
        this.printedTriggeredAbilitiesUuidByTargetCard = undefined;
    }
}
