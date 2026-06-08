import type { AbilityContext } from '../ability/AbilityContext';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { CardTypeFilter, EntryType } from '../Constants';
import { WildcardCardType } from '../Constants';
import type { Game } from '../Game';
import { registerState } from '../GameObjectUtils';
import { OngoingEffectValueWrapperBase } from '../ongoingEffect/effectImpl/OngoingEffectValueWrapper';
import { Contract } from '../utils/Contract';
import { EnumHelpers } from '../utils/EnumHelpers';

export interface IUnitsEnterPlayReadyForPlayerProperties {

    /** Card types the matcher considers. Defaults to any unit. */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];

    /**
     * Which entry paths the matcher applies to.
     *
     * Only units matching the entry type(s) will be made to enter play ready.
     */
    entryType: EntryType | Set<EntryType>;

    /** Additional predicate the entering card must satisfy. */
    match?: (card: IUnitCard, context: AbilityContext) => boolean;

    /** Use limit. Defaults to unlimited. */
    limit?: AbilityLimit;
}

/**
 * Player-scoped matcher that grants the "enters play ready" status to the next
 * unit a player plays that satisfies the configured filter / predicate.
 *
 * The matcher is consulted by `PutIntoPlaySystem` at entry time (before the card
 * has finished entering play).
 */
@registerState()
export class UnitsEnterPlayReadyForPlayer extends OngoingEffectValueWrapperBase<UnitsEnterPlayReadyForPlayer> {
    private readonly cardTypeFilter: CardTypeFilter | CardTypeFilter[];
    private readonly entryTypes: Set<EntryType>;
    private readonly match?: (card: IUnitCard, context: AbilityContext) => boolean;
    private readonly limit?: AbilityLimit;

    public constructor(game: Game, properties: IUnitsEnterPlayReadyForPlayerProperties) {
        super(game, null);

        this.cardTypeFilter = properties.cardTypeFilter ?? WildcardCardType.Unit;
        this.entryTypes = properties.entryType instanceof Set
            ? properties.entryType
            : new Set([properties.entryType]);
        this.match = properties.match;
        this.limit = properties.limit;
    }

    public override getValue(): UnitsEnterPlayReadyForPlayer {
        return this;
    }

    public override apply(_target: unknown): void {
        this.limit?.registerEvents();
    }

    public override unapply(_target: unknown): void {
        this.limit?.unregisterEvents();
    }

    public canApplyTo(card: Card, context: AbilityContext, entryType: EntryType): boolean {
        if (!card.isUnit()) {
            Contract.fail('UnitsEnterPlayReadyForPlayer can only apply to units');
        }

        if (this.limit && this.limit.isAtMax(context.player)) {
            return false;
        }
        if (!this.entryTypes.has(entryType)) {
            return false;
        }
        if (!EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter)) {
            return false;
        }
        if (this.match && !this.match(card, context)) {
            return false;
        }
        return true;
    }

    public applyTo(_card: Card, context: AbilityContext): void {
        this.limit?.increment(context.player);
    }
}
