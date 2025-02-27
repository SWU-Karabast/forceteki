import type { AbilityContext } from '../core/ability/AbilityContext';
import { CreateTokenUnitSystem, type ICreateTokenUnitProperties } from './CreateTokenUnitSystem';
import { TokenUnitName } from '../core/Constants';

export type ICreateTieFighterProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateTieFighterSystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create tie fighter';

    protected override getTokenType() {
        return TokenUnitName.TIEFighter;
    }
}
