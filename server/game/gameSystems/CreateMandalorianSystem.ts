import type { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUnitName } from '../core/Constants';
import type { ICreateTokenUnitProperties } from './CreateTokenUnitSystem';
import { CreateTokenUnitSystem } from './CreateTokenUnitSystem';

export type ICreateMandalorianProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateMandalorianSystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create mandalorian';

    protected override getTokenType() {
        return TokenUnitName.Mandalorian;
    }
}
