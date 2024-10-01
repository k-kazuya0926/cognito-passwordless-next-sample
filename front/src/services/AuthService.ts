import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';

// Define a custom type for CognitoUser with challengeParam
type CognitoUserWithEmail = CognitoUser & { challengeParam: { email: string } };

class AuthService {
    private cognitoUser: CognitoUserWithEmail | null = null;

    public async signIn(email: string): Promise<void> {
        this.cognitoUser = await Auth.signIn(email) as CognitoUserWithEmail; // ここでclientMetadataを渡してもLambdaに渡されない
    }

    public async signOut(): Promise<void> {
        await Auth.signOut();
    }

    public async answerCustomChallenge(answer: string): Promise<boolean> {
        if (this.cognitoUser) {
            this.cognitoUser = await Auth.sendCustomChallengeAnswer(this.cognitoUser, answer, {
                signInMethod: "ONE_TIME_CODE",
            }) as CognitoUserWithEmail;
            return this.isAuthenticated();
        }
        return false;
    }

    public getPublicChallengeParameters(): Record<string, string> | null {
        return this.cognitoUser ? this.cognitoUser.challengeParam : null;
    }

    public async signUp(email: string, password: string): Promise<void> {
        const params = {
            username: email,
            password: password,
        };
        await Auth.signUp(params);
    }

    public async isAuthenticated(): Promise<boolean> {
        try {
            await Auth.currentSession();
            return true;
        } catch {
            return false;
        }
    }

    public async getUserDetails(): Promise<any> {
        if (!this.cognitoUser) {
            this.cognitoUser = await Auth.currentAuthenticatedUser() as CognitoUserWithEmail;
        }
        return await Auth.userAttributes(this.cognitoUser);
    }

}

export default new AuthService();