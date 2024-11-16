import type { AbilityContext } from './AbilityContext.js';
import { CardAbility } from './CardAbility.js';
import { AbilityType, ZoneName, PhaseName } from '../Constants.js';
import type { IEventAbilityProps } from '../../Interfaces.js';
import type { Card } from '../card/Card.js';
import type Game from '../Game.js';

export class EventAbility extends CardAbility {
    protected anyPlayer: boolean;
    protected doesNotTarget: boolean;
    protected phase: string;

    public constructor(game: Game, card: Card, properties: IEventAbilityProps) {
        super(game, card, properties, AbilityType.Event);

        this.doesNotTarget = (properties as any).doesNotTarget;
    }

    public override meetsRequirements(context: AbilityContext = this.createContext(), ignoredRequirements = []) {
        if (!ignoredRequirements.includes('zone') && this.card.zoneName !== ZoneName.Discard) {
            return 'zone';
        }

        if (!ignoredRequirements.includes('phase') && this.game.currentPhase !== PhaseName.Action) {
            return 'phase';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }
}
