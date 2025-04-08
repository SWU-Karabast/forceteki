import { TokenCard } from '../../../core/card/TokenCards';

export default class Force extends TokenCard {
    protected override getImplementationId() {
        return {
            id: 'temp-force-id',
            internalName: 'force',
        };
    }
}