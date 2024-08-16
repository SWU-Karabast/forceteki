export class Spectator {
    public readonly buttons = [];
    public readonly menuTitle = 'Spectator mode';
    public readonly name: string;
    public readonly emailHash: string;
    public readonly lobbyId?: string;

    public constructor(
        public id: string,
        public user: { username: string; emailHash: string }
    ) {
        this.name = this.user.username;
        this.emailHash = this.user.emailHash;
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
