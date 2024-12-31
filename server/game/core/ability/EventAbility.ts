import type { AbilityContext } from './AbilityContext.js';
import { CardAbility } from './CardAbility.js';
import { AbilityType, ZoneName, PhaseName } from '../Constants.js';
import type { IEventAbilityProps } from '../../Interfaces.js';
import type { Card } from '../card/Card.js';
import type Game from '../Game.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';

export class EventAbility extends CardAbility {
    protected anyPlayer: boolean;
    protected doesNotTarget: boolean;
    protected phase: string;

    public constructor(game: Game, card: Card, properties: IEventAbilityProps) {
        // since event abilities are broken into two stages of resolution, need to make sure
        // that the first stage is the one that all triggers go to
        const adjustedProperties = {
            ...properties,
            triggerHandlingMode: TriggerHandlingMode.PassesTriggersToParentWindow
        };

        super(game, card, adjustedProperties, AbilityType.Event);

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
