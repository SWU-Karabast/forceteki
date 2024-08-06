import type { AbilityContext } from '../AbilityContext';
import { GameAction, type GameActionProperties } from './GameAction';
import type { StatusToken } from '../StatusToken';

export interface TokenActionProperties extends GameActionProperties {}

export class TokenAction<P extends TokenActionProperties = TokenActionProperties> extends GameAction<P> {
    targetType = ['token'];

    defaultTargets(context: AbilityContext): StatusToken[] {
        return context.source.statusTokens ? [...context.source.statusTokens] : [];
    }

    canAffect(target: StatusToken, context: AbilityContext, additionalProperties = {}): boolean {
        if (Array.isArray(target)) {
            return target.length > 0 && target.every((a) => a.type === 'token');
        }
        return target.type === 'token';
    }

    checkEventCondition(event: any, additionalProperties = {}): boolean {
        return this.canAffect(event.token, event.context, additionalProperties);
    }

    addPropertiesToEvent(event, token: StatusToken, context: AbilityContext, additionalProperties): void {
        super.addPropertiesToEvent(event, token, context, additionalProperties);
        event.token = token;
        if (Array.isArray(event.token)) {
            event.token = [...event.token];
        }
    }
}