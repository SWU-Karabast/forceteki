import { TokenUnitCard } from '../../../core/card/TokenCards';

export default class Beast extends TokenUnitCard {
    protected override getImplementationId() {
        return {
            id: 'beast-id',
            internalName: 'beast',
        };
    }
}
