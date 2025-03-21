import { createOAuthDeviceAuth, OAuthAppStrategyOptions } from "@octokit/auth-oauth-device";

import { M } from "../utils/debugging-and-logging.js";

export class Github {
    constructor(
        private readonly client_id: string,
        private readonly client_secret: string,
    ) {}

    async associate(prompt: (verification_uri: string, user_code: string) => Promise<boolean>) {
        const auth = createOAuthDeviceAuth({
            clientId: this.client_id,
            async onVerification(verification) {
                await prompt(verification.verification_uri, verification.user_code);
            },
        });
        const bla = await auth({ type: "oauth", scopes: ["user:email"] });
    }
}
