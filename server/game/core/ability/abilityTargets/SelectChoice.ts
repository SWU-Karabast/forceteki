import { TargetMode } from '../../Constants';

export class SelectChoice {
    public constructor(public choice: string) {}

    public getShortSummary() {
        return {
            id: this.choice,
            label: this.choice,
            name: this.choice,
            type: TargetMode.Select
        };
    }
}
