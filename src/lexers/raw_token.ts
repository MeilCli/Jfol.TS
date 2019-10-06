import { RawTokenType } from "./raw_token_type";

export interface RawToken {
    readonly rawText: string;
    readonly type: RawTokenType;
}
