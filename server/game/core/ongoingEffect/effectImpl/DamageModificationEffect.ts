import type { IDamageModificationAbilityProps } from '../../../Interfaces';
import type DamageModificationAbility from '../../ability/DamageModificationAbility';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { Player } from '../../Player';
import { Contract } from '../../utils/Contract';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { registerState, stateRef, stateRefMap } from '../../GameObjectUtils';

/**
 * An effect that modifies damage dealt to (or by) the card it applies to, such as "for this phase, prevent
 * all combat damage that would be dealt to that unit".
 *
 * The engine resolves damage modification in the replacement effect window, which works with abilities, so this
 * builds a {@link DamageModificationAbility} for each card it applies to. Unlike {@link GainAbility}, the ability is
 * held here and never added to the card: the card does not gain an ability, so it is unaffected by the card losing
 * all abilities (whether before or after this effect is created) and can't be copied to another card.
 *
 * The ability is still bound to the affected card, so it resolves with that card as its source and its controller
 * as the player who resolves it, as for any other replacement effect on that card. Chat still credits the player who
 * created the effect, which may be that card's opponent.
 */
@registerState()
export class DamageModificationEffect extends OngoingEffectValueWrapperBase<IDamageModificationAbilityProps> {
    @stateRef() private accessor _source: Card | null = null;
    @stateRef() private accessor _controller: Player | null = null;
    @stateRefMap() private accessor _abilityByTargetCard = new Map<string, DamageModificationAbility>();

    public constructor(game: Game, properties: IDamageModificationAbilityProps) {
        super(game, properties);
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);
        Contract.assertTrue(context.ongoingEffect?.isLastingEffect, 'DamageModificationEffect can only be used by a lasting effect');

        super.setContext(context);

        this._source = context.source;
        this._controller = context.player;
    }

    public override apply(target: InPlayCard) {
        Contract.assertNotNullLike(this._source, 'DamageModificationEffect.apply() called before setContext()');
        Contract.assertTrue(target.canRegisterTriggeredAbilities(), `Card ${target.internalName} cannot have damage modified by a lasting effect`);
        Contract.assertDoesNotHaveKey(this._abilityByTargetCard, target.uuid, `Attempting to apply lasting damage modification to card ${target.internalName} twice`);

        // abilityIdentifier is read by CardAbility but isn't part of the ability props type (GainAbility passes it the same way)
        const properties = {
            ...this.getValue(),
            printedAbility: false,
            lastingEffectSource: this._source,
            lastingEffectController: this._controller,
            abilityIdentifier: `${this._source.internalName}_lasting_damage_modification`
        };

        const ability = target.createDamageModificationAbility(properties);
        ability.registerEvents();

        this._abilityByTargetCard.set(target.uuid, ability);
    }

    public override unapply(target: InPlayCard) {
        const ability = this._abilityByTargetCard.get(target.uuid);
        Contract.assertNotNullLike(ability, `Attempting to unapply lasting damage modification from card ${target.internalName} but it is not applied`);

        ability.unregisterEvents();
        this._abilityByTargetCard.delete(target.uuid);
    }
}
