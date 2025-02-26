import type { User } from './Settings';

export class Spectator {
    public readonly buttons = [];
    public readonly menuTitle = 'Spectator mode';
    public readonly name: string;

    public constructor(
        public id: string,
        public user: User
    ) {
        this.name = this.user.username;
    }

    public getCardSelectionState() {
        return {};
    }

    public getShortSummary() {
        return {
            name: this.name,
            id: this.id,
            type: 'spectator'
        };
    }
}
