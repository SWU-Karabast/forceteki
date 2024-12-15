import { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUnitName } from '../core/Constants';
import { CreateTokenUnitSystem, ICreateTokenUnitProperties } from './CreateTokenUnitSystem';

export type ICreateCloneTrooperProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateCloneTrooperSystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create clone trooper';

    protected override getTokenType() {
        return TokenUnitName.CloneTrooper;
    }
}
